import prisma from "@/lib/db";
import { refresshToken } from "@/lib/fetch";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const workflowsRouter = createTRPCRouter({
  refreshTokens: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.auth.user.id,
      },
      include: {
        integrations: true,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.integrations.length > 0) {
      const today = new Date();
      const time_left =
        user.integrations[0].expiresAt?.getTime()! - today.getTime();

      const days = Math.floor(time_left / (1000 * 3600 * 24));

      if (days < 5) {
        console.log("Refresh");

        const refresh = await refresshToken(user.integrations[0].token);

        const today = new Date();
        const expiresAt = today.setDate(today.getDate() + 60);

        const update_token = await prisma.integration.update({
          where: {
            id: user.integrations[0].id,
          },
          data: {
            token: refresh.access_token,
            expiresAt: new Date(expiresAt),
          },
        });

        if (!update_token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update token",
          });
        }
      }
    }
  }),
});
