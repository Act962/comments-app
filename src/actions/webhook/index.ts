import prisma from "@/lib/db";

export const matchKeyword = async (keyword: string) => {
  return await prisma.keyword.findFirst({
    where: {
      word: {
        equals: keyword,
        mode: "insensitive",
      },
    },
  });
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
