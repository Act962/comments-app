import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const integrationRouter = createTRPCRouter({
  getIntegrations: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.integration.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
});
