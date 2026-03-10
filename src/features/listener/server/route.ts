import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const listenerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        automationId: z.string(),
        listener: z.enum(["SMARTAI", "MESSAGE"]),
        prompt: z.string(),
        reply: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.listerner.create({
        data: {
          automationId: input.automationId,
          listener: input.listener,
          prompt: input.prompt,
          commentReply: input.reply,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        automationId: z.string(),
        listener: z.enum(["SMARTAI", "MESSAGE"]).optional(),
        prompt: z.string().optional(),
        reply: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.listerner.update({
        where: {
          automationId: input.automationId,
        },
        data: {
          listener: input.listener,
          prompt: input.prompt,
          commentReply: input.reply,
        },
      });
    }),
});
