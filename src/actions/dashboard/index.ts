"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const organizationId =
    (session.session as { activeOrganizationId?: string | null })
      .activeOrganizationId ?? null;

  if (!organizationId) {
    return {
      totalAutomations: 0,
      activeAutomations: 0,
      totalDMs: 0,
      totalComments: 0,
      aiResponses: 0,
      standardResponses: 0,
      chartData: [],
      recentActivity: [],
    };
  }

  const [totalAutomations, activeAutomations, automationData] =
    await Promise.all([
      prisma.automation.count({
        where: { organizationId },
      }),
      prisma.automation.count({
        where: { organizationId, active: true },
      }),
      prisma.automation.findMany({
        where: { organizationId },
        select: {
          listeners: {
            select: {
              dmCount: true,
              commentCount: true,
              listener: true,
            },
          },
        },
      }),
    ]);

  const totalDMs = automationData.reduce(
    (acc, curr) => acc + (curr.listeners?.dmCount || 0),
    0,
  );
  const totalComments = automationData.reduce(
    (acc, curr) => acc + (curr.listeners?.commentCount || 0),
    0,
  );

  const aiResponses = automationData
    .filter((a) => a.listeners?.listener === "SMARTAI")
    .reduce(
      (acc, curr) =>
        acc +
        (curr.listeners?.dmCount || 0) +
        (curr.listeners?.commentCount || 0),
      0,
    );

  const standardResponses = automationData
    .filter((a) => a.listeners?.listener === "MESSAGE")
    .reduce(
      (acc, curr) =>
        acc +
        (curr.listeners?.dmCount || 0) +
        (curr.listeners?.commentCount || 0),
      0,
    );

  // Fetch activity from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const historyData = await prisma.history.findMany({
    where: {
      organizationId,
      date: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Group history data by day
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const chartDataMap: Record<
    string,
    { name: string; dms: number; comments: number }
  > = {};

  // Initialize the last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];
    chartDataMap[dateStr] = { name: dayName, dms: 0, comments: 0 };
  }

  historyData.forEach((item) => {
    const dateStr = item.date.toISOString().split("T")[0];
    if (chartDataMap[dateStr]) {
      if (item.type === "DM") {
        chartDataMap[dateStr].dms += item.count;
      } else if (item.type === "COMMENT") {
        chartDataMap[dateStr].comments += item.count;
      }
    }
  });

  const chartData = Object.values(chartDataMap);

  const recentActivity = await prisma.dms.findMany({
    where: {
      automation: {
        organizationId,
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    totalAutomations,
    activeAutomations,
    totalDMs,
    totalComments,
    aiResponses,
    standardResponses,
    chartData,
    recentActivity,
  };
}
