import prisma from "@/lib/db";
import {
  createTRPCRouter,
  protectedOrgProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

async function ensureAutomationInOrg(
  automationId: string,
  organizationId: string,
) {
  const automation = await prisma.automation.findFirst({
    where: { id: automationId, organizationId },
    select: { id: true },
  });
  if (!automation) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Automação não encontrada",
    });
  }
}

export const automationsRouter = createTRPCRouter({
  create: protectedOrgProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx }) => {
      return await prisma.automation.create({
        data: {
          userId: ctx.auth.user.id,
          organizationId: ctx.organizationId,
        },
      });
    }),
  getMany: protectedOrgProcedure.query(async ({ ctx }) => {
    return await prisma.automation.findMany({
      where: {
        organizationId: ctx.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        keywords: true,
        listeners: true,
      },
    });
  }),
  getOne: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.automation.findUnique({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          keywords: true,
          listeners: {
            include: {
              buttons: { orderBy: { order: "asc" } },
            },
          },
          triggers: true,
          dms: true,
          posts: true,
        },
      });
    }),
  delete: protectedOrgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.automation.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      });
    }),
  updateName: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureAutomationInOrg(input.id, ctx.organizationId);

      const automation = await prisma.automation.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });

      if (!automation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update automation",
        });
      }

      return automation;
    }),
  updateActive: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const automation = await prisma.automation.findUnique({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          keywords: true,
          listeners: true,
          triggers: true,
          posts: true,
        },
      });

      if (!automation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update automation",
        });
      }

      if (automation.keywords.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Adicione uma palavra-chave",
        });
      }

      const typeAutomation = automation.triggers[0].type as "DM" | "COMMENT";

      if (typeAutomation === "COMMENT" && !automation.listeners?.listener) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Adicione um função ao seu post",
        });
      }

      if (typeAutomation === "COMMENT" && automation.posts.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Adicione um post",
        });
      }

      const updateAutomation = await prisma.automation.update({
        where: {
          id: input.id,
        },
        data: {
          active: input.active,
        },
      });

      return updateAutomation;
    }),
  savePost: protectedOrgProcedure
    .input(
      z.object({
        automationId: z.string(),
        posts: z.array(
          z.object({
            postId: z.string(),
            caption: z.string().optional(),
            media: z.string(),
            mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureAutomationInOrg(input.automationId, ctx.organizationId);

      await prisma.post.createMany({
        data: input.posts.map((post) => ({
          ...post,
          automationId: input.automationId,
        })),
      });

      return {
        automationId: input.automationId,
      };
    }),
  deletePost: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await prisma.post.findUnique({
        where: {
          id: input.id,
        },
        include: {
          automation: {
            select: {
              id: true,
              organizationId: true,
              posts: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post não encontrado",
        });
      }

      if (post.automation?.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem acesso a este post",
        });
      }

     /*  if (post.automation?.posts.length === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Automação precisa de pelo menos 1 post",
        });
      } */

      return await prisma.post.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateIntegrationToken: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        expire: z.date(),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.integration.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
        select: { id: true },
      });
      if (!existing) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Integração não encontrada",
        });
      }

      const integration = await prisma.integration.update({
        where: {
          id: input.id,
        },
        data: {
          token: input.token,
          expiresAt: input.expire,
        },
      });

      if (!integration) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update integration",
        });
      }

      return integration;
    }),
});
