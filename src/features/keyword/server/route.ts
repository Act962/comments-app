import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const keywordRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        keyword: z.string(),
        automationId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.keyword.create({
        data: {
          word: input.keyword,
          automationId: input.automationId,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.keyword.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
