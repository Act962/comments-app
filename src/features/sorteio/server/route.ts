import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedOrgProcedure } from "@/trpc/init";
import { backfillCommentsFromInstagram } from "./comments-collector";
import { performDraw, performReplaceWinner } from "./draw-engine";
import type { SorteioDetail, SorteioListItem } from "./types";

const rulesSchema = z
  .object({
    dedupePerUser: z.boolean().optional(),
    minWords: z.number().int().nonnegative().optional(),
    requireMention: z.boolean().optional(),
  })
  .optional();

function slugify(input: string) {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "sorteio"}-${suffix}`;
}

async function ensureOrgOwnership(sorteioId: string, organizationId: string) {
  const sorteio = await prisma.sorteio.findFirst({
    where: { id: sorteioId, organizationId },
  });
  if (!sorteio) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Sorteio não encontrado",
    });
  }
  return sorteio;
}

export const sorteioRouter = createTRPCRouter({
  create: protectedOrgProcedure
    .input(z.object({ title: z.string().min(1).max(120) }))
    .mutation(async ({ ctx, input }): Promise<{ id: string; slug: string }> => {
      const created = await prisma.sorteio.create({
        data: {
          userId: ctx.auth.user.id,
          organizationId: ctx.organizationId,
          title: input.title,
          slug: slugify(input.title),
        },
        select: { id: true, slug: true },
      });
      return created;
    }),

  getMany: protectedOrgProcedure.query(async ({ ctx }) => {
    return (await prisma.sorteio.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { comments: true, posts: true, winners: true } },
      },
    })) as SorteioListItem[];
  }),

  getOne: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }): Promise<SorteioDetail> => {
      const sorteio = await prisma.sorteio.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
        include: {
          posts: true,
          winners: {
            orderBy: { position: "asc" },
            include: { comment: true },
          },
          _count: { select: { comments: true } },
        },
      });

      if (!sorteio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sorteio não encontrado",
        });
      }

      return sorteio as unknown as SorteioDetail;
    }),

  update: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(120).optional(),
        prizeName: z.string().max(120).nullish(),
        prizeDescription: z.string().max(2000).nullish(),
        prizeImage: z.string().url().nullish(),
        winnersCount: z.number().int().min(1).max(100).optional(),
        rules: rulesSchema,
      }),
    )
    .mutation(async ({ ctx, input }): Promise<{ id: string }> => {
      await ensureOrgOwnership(input.id, ctx.organizationId);

      const { id, rules, ...rest } = input;

      await prisma.sorteio.update({
        where: { id },
        data: {
          ...rest,
          rules: rules === undefined ? undefined : (rules ?? null),
        },
      });
      return { id };
    }),

  delete: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }): Promise<{ id: string }> => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      await prisma.sorteio.delete({ where: { id: input.id } });
      return { id: input.id };
    }),

  addPosts: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        posts: z.array(
          z.object({
            postId: z.string(),
            caption: z.string().optional(),
            media: z.string(),
            mediaUrl: z.string().optional(),
            permalink: z.string().optional(),
            mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureOrgOwnership(input.id, ctx.organizationId);

      await prisma.sorteioPost.createMany({
        data: input.posts.map((post) => ({
          sorteioId: input.id,
          ...post,
        })),
        skipDuplicates: true,
      });

      return { sorteioId: input.id };
    }),

  removePost: protectedOrgProcedure
    .input(z.object({ id: z.string(), postId: z.string() }))
    .mutation(async ({ ctx, input }): Promise<{ count: number }> => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      const result = await prisma.sorteioPost.deleteMany({
        where: { sorteioId: input.id, postId: input.postId },
      });
      return { count: result.count };
    }),

  startCollecting: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sorteio = await ensureOrgOwnership(input.id, ctx.organizationId);

      const postCount = await prisma.sorteioPost.count({
        where: { sorteioId: sorteio.id },
      });
      if (postCount === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Adicione pelo menos um post antes de iniciar a coleta",
        });
      }

      await prisma.sorteio.update({
        where: { id: sorteio.id },
        data: { status: "COLLECTING" },
      });

      const stats = await backfillCommentsFromInstagram(sorteio.id);
      return stats;
    }),

  closeCollecting: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }): Promise<{ id: string }> => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      await prisma.sorteio.update({
        where: { id: input.id },
        data: { status: "CLOSED" },
      });
      return { id: input.id };
    }),

  resync: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      return await backfillCommentsFromInstagram(input.id);
    }),

  listComments: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      await ensureOrgOwnership(input.id, ctx.organizationId);

      const items = await prisma.sorteioComment.findMany({
        where: { sorteioId: input.id },
        orderBy: { commentedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | null = null;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id ?? null;
      }

      const totals = await prisma.sorteioComment.aggregate({
        where: { sorteioId: input.id },
        _count: { _all: true },
      });

      const uniqueUsers = await prisma.sorteioComment.groupBy({
        by: ["fromId"],
        where: { sorteioId: input.id },
      });

      return {
        items,
        nextCursor,
        total: totals._count._all,
        uniqueUsers: uniqueUsers.length,
      };
    }),

  draw: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        count: z.number().int().min(1).max(50).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      return performDraw(input.id, input.count);
    }),

  replaceWinner: protectedOrgProcedure
    .input(z.object({ id: z.string(), winnerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ensureOrgOwnership(input.id, ctx.organizationId);
      return performReplaceWinner(input.id, input.winnerId);
    }),
});
