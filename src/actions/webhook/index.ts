import prisma from "@/lib/db";

// export const matchKeyword = async (keyword: string, userId: string) => {
//   return await prisma.keyword.findFirst({
//     where: {
//       word: {
//         equals: keyword,
//         mode: "insensitive",
//       },
//       automation: {
//         active: true,
//         userId,
//       },
//     },
//   });
// };

export const matchKeyword = async (keyword: string, userId: string) => {
  // Busca keywords ativas do usuário
  const keywords = await prisma.keyword.findMany({
    where: {
      automation: {
        active: true,
        userId,
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
      listeners: true,
      user: {
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
    select: { userId: true },
  });

  if (!automation) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.history.upsert({
    where: {
      // Since we don't have a unique constraint on (userId, date, type) in the schema yet,
      // and date contains time, we'll find existing or create.
      // Actually, let's use a findFirst and update or create to keep it simple without schema changes.
      id:
        (
          await prisma.history.findFirst({
            where: {
              userId: automation.userId,
              date: today,
              type: type,
            },
          })
        )?.id || "new-id",
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId: automation.userId,
      date: today,
      type: type,
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
      userId: true,
    },
  });
};
