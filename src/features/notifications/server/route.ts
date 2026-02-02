import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const notificationsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.notification.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
      select: {
        id: true,
        title: true,
        message: true,
        read: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const notifications = await prisma.notification.update({
        where: {
          userId: ctx.auth.user.id,
          id: input.id,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return notifications;
    }),
});
