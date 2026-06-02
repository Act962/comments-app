import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedOrgProcedure } from "@/trpc/init";

export const organizationRouter = createTRPCRouter({
  deleteInvitation: protectedOrgProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await prisma.invitation.findUnique({
        where: { id: input.invitationId },
        select: { organizationId: true, status: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado",
        });
      }

      if (invitation.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem acesso a este convite",
        });
      }

      if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem excluir convites",
        });
      }

      if (invitation.status === "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Revogue o convite antes de excluir",
        });
      }

      await prisma.invitation.delete({ where: { id: input.invitationId } });
      return { id: input.invitationId };
    }),
});
