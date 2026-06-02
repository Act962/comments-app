import prisma from "@/lib/db";
import { createTRPCRouter, protectedOrgProcedure } from "@/trpc/init";
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

export const triggerRouter = createTRPCRouter({
  create: protectedOrgProcedure
    .input(
      z.object({
        type: z.enum(["DM", "COMMENT"]),
        automationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureAutomationInOrg(input.automationId, ctx.organizationId);

      return await prisma.trigger.create({
        data: {
          type: input.type,
          automationId: input.automationId,
        },
      });
    }),
  delete: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const trigger = await prisma.trigger.findUnique({
        where: { id: input.id },
        select: {
          automation: { select: { organizationId: true } },
        },
      });
      if (!trigger || trigger.automation?.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem acesso a este gatilho",
        });
      }

      return await prisma.trigger.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
