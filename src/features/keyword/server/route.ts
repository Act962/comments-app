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

export const keywordRouter = createTRPCRouter({
  create: protectedOrgProcedure
    .input(
      z.object({
        keyword: z.string(),
        automationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureAutomationInOrg(input.automationId, ctx.organizationId);

      const keyword = await prisma.keyword.findFirst({
        where: {
          word: {
            equals: input.keyword,
            mode: "insensitive",
          },
          automationId: input.automationId,
        },
      });
      if (keyword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Palavra-chave já existe",
        });
      }
      return await prisma.keyword.create({
        data: {
          word: input.keyword,
          automationId: input.automationId,
        },
      });
    }),
  delete: protectedOrgProcedure
    .input(
      z.object({
        id: z.string(),
        automationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ensureAutomationInOrg(input.automationId, ctx.organizationId);

      const keyword = await prisma.keyword.delete({
        where: {
          id: input.id,
          automationId: input.automationId,
        },
      });

      return keyword;
    }),
});
