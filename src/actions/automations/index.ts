"use server";

import prisma from "@/lib/db";

export const findAutomation = async (id: string) => {
  return await prisma.automation.findUnique({
    where: {
      id,
    },
    include: {
      keywords: true,
      listeners: true,
      triggers: true,
      user: {
        select: {
          integrations: true,
        },
      },
    },
  });
};
