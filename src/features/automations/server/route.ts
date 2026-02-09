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
  updateActive: protectedProcedure
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
          userId: ctx.auth.user.id,
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
  savePost: protectedProcedure
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
    .mutation(async ({ input }) => {
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
  deletePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const post = await prisma.post.findUnique({
        where: {
          id: input.id,
        },
        include: {
          automation: {
            include: {
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

      if (post.automation?.posts.length === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Automação precisa de pelo menos 1 post",
        });
      }

      return await prisma.post.delete({
        where: {
          id: input.id,
        },
      });
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
