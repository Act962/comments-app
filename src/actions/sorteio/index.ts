"use server";

import prisma from "@/lib/db";

export const getInstagramIntegration = async (userId: string) => {
  return await prisma.integration.findFirst({
    where: {
      userId,
      name: "INSTAGRAM",
    },
  });
};

export const getInstagramToken = async (userId: string) => {
  const integration = await getInstagramIntegration(userId);
  return integration?.token ?? null;
};
