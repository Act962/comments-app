import prisma from "@/lib/db";

export const matchKeyword = async (
  keyword: string,
  organizationId: string,
) => {
  // Busca keywords ativas da empresa
  const keywords = await prisma.keyword.findMany({
    where: {
      automation: {
        active: true,
        organizationId,
      },
    },
    include: {
      automation: true,
    },
  });

  if (!keywords.length) return null;

  // Normaliza o texto
  const normalizedText = keyword.toLowerCase().trim();

  // Encontra match com prioridade (keywords mais longas primeiro)
  const sortedKeywords = keywords.sort((a, b) => b.word.length - a.word.length);

  for (const kw of sortedKeywords) {
    const normalizedWord = kw.word.toLowerCase().trim();

    // Verifica se a keyword existe no texto
    if (normalizedText.includes(normalizedWord)) {
      return kw;
    }
  }

  return null;
};

export const getKeywordAutomation = async (
  automationId: string,
  dm: boolean,
) => {
  return await prisma.automation.findUnique({
    where: {
      id: automationId,
      active: true,
    },
    include: {
      dms: dm,
      triggers: {
        where: {
          type: dm ? "DM" : "COMMENT",
        },
      },
      listeners: {
        include: {
          buttons: { orderBy: { order: "asc" } },
        },
      },
      organization: {
        select: {
          integrations: true,
        },
      },
    },
  });
};

export const trackResponse = async (
  automationId: string,
  type: "COMMENT" | "DM",
) => {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId, active: true },
    select: { organizationId: true, userId: true },
  });

  if (!automation?.organizationId) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.history.findFirst({
    where: {
      organizationId: automation.organizationId,
      date: today,
      type,
    },
  });

  await prisma.history.upsert({
    where: {
      id: existing?.id || "new-id",
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      organizationId: automation.organizationId,
      userId: automation.userId,
      date: today,
      type,
      count: 1,
    },
  });

  if (type === "COMMENT") {
    return await prisma.listerner.update({
      where: {
        automationId,
      },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });
  }

  if (type === "DM") {
    return await prisma.listerner.update({
      where: {
        automationId,
      },
      data: {
        dmCount: {
          increment: 1,
        },
      },
    });
  }
};

export const getKeywordPost = async (postId: string, automationId: string) => {
  return await prisma.post.findFirst({
    where: {
      AND: [{ postId: postId }, { automationId }],
    },
    select: { automation: true },
  });
};

export const getIntegration = async (accountId: string) => {
  return await prisma.integration.findUnique({
    where: {
      instagramId: accountId,
    },
    select: {
      organizationId: true,
    },
  });
};
