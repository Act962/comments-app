import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const automationsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.automation.create({
        data: {
          userId: ctx.auth.user.id,
        },
      });
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.automation.findMany({
      where: {
        userId: ctx.auth.user.id,
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
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.automation.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          keywords: true,
          listeners: true,
          triggers: true,
          dms: true,
          posts: true,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.automation.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
  savePost: protectedProcedure
    .input(
      z.object({
        automationId: z.string(),
        posts: z.array(
          z.object({
            postId: z.string(),
            caption: z.string().optional(),
            media: z.string(),
            mediaType: z.enum(["IMAGE", "VIDEO", "CAROSEL_ALBUM"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
  updateIntegrationToken: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        expire: z.date(),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
