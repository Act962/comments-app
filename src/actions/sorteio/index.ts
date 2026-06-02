"use server";

import prisma from "@/lib/db";

export const getInstagramIntegration = async (organizationId: string) => {
  return await prisma.integration.findFirst({
    where: {
      organizationId,
      name: "INSTAGRAM",
    },
  });
};

export const getInstagramToken = async (organizationId: string) => {
  const integration = await getInstagramIntegration(organizationId);
  return integration?.token ?? null;
};
