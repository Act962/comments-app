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

export const ensureEventNotProcessed = async (
  eventId: string,
  type: string,
  accountId: string,
) => {
  try {
    await prisma.processedEvent.create({
      data: {
        id: eventId,
        type,
        accountId,
      },
    });

    return true; // nunca foi processado
  } catch (error: any) {
    if (error.code === "P2002") {
      return false; // já foi processado
    }

    throw error;
  }
};
