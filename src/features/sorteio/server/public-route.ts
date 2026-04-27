import { TRPCError } from "@trpc/server";
import z from "zod";
import { getInstagramIntegration } from "@/actions/sorteio";
import prisma from "@/lib/db";
import { getUserMedia } from "@/lib/fetch";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

export const sorteioPublicRouter = createTRPCRouter({
  listInstagramMedia: protectedProcedure.query(async ({ ctx }) => {
    const integration = await getInstagramIntegration(ctx.auth.user.id);
    if (!integration?.token || !integration.instagramId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Conecte sua conta Instagram primeiro",
      });
    }

    try {
      return await getUserMedia(integration.instagramId, integration.token);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_GATEWAY",
        message: "Falha ao buscar mídias do Instagram",
        cause: error,
      });
    }
  }),

  getPublicBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const sorteio = await prisma.sorteio.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          userId: true,
          title: true,
          prizeName: true,
          prizeDescription: true,
          prizeImage: true,
          winnersCount: true,
          status: true,
          slug: true,
          lastDrawnAt: true,
          _count: { select: { comments: true, posts: true } },
          winners: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              position: true,
              drawnAt: true,
              comment: {
                select: {
                  text: true,
                  fromUsername: true,
                  commentedAt: true,
                },
              },
            },
          },
        },
      });

      if (!sorteio) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sorteio não encontrado",
        });
      }

      const distinctUsers = await prisma.sorteioComment.findMany({
        where: { sorteioId: sorteio.id },
        distinct: ["fromId"],
        select: { fromId: true },
      });

      return {
        ...sorteio,
        participantsCount: distinctUsers.length,
      };
    }),
});
