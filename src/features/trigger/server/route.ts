import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const triggerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["DM", "COMMENT"]),
        automationId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.trigger.create({
        data: {
          type: input.type,
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
      return await prisma.trigger.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
