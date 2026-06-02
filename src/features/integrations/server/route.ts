import prisma from "@/lib/db";
import { createTRPCRouter, protectedOrgProcedure } from "@/trpc/init";

export const integrationRouter = createTRPCRouter({
  getIntegrations: protectedOrgProcedure.query(async ({ ctx }) => {
    return await prisma.integration.findMany({
      where: {
        organizationId: ctx.organizationId,
      },
    });
  }),
});
