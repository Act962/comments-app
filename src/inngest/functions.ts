// src/inngest/functions.ts
import prisma from "@/lib/db";
import { refreshToken } from "@/lib/fetch";
import { markIntegrationBroken } from "@/lib/instagram-api";
import { inngest } from "./client";

export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  },
);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const refreshInstagramTokens = inngest.createFunction(
  {
    id: "refresh-instagram-tokens",
    triggers: { cron: "0 3 * * *" },
  },
  async ({ step }) => {
    // Estratégia atual: refresh DIÁRIO de toda integração ativa com ≥24h de
    // vida (limite da Graph API para ig_refresh_token). Mais agressivo do que
    // o estritamente necessário, mas elimina a janela em que a Meta pode
    // revogar o token antes de a renovação acontecer.
    const minAgeCutoff = new Date(Date.now() - ONE_DAY_MS);

    const integrations = await step.run("load-integrations", async () => {
      return prisma.integration.findMany({
        where: {
          name: "INSTAGRAM",
          status: "ACTIVE",
          createdAt: { lt: minAgeCutoff },
        },
        select: { id: true, token: true, userId: true },
      });
    });

    let refreshed = 0;
    let broken = 0;

    for (const integration of integrations) {
      await step.run(`refresh-${integration.id}`, async () => {
        try {
          const result = await refreshToken(integration.token);
          await prisma.integration.update({
            where: { id: integration.id },
            data: {
              token: result.access_token,
              expiresAt: new Date(Date.now() + result.expires_in * 1000),
              lastRefreshedAt: new Date(),
              lastRefreshError: null,
            },
          });
          refreshed++;
        } catch (err) {
          const status =
            (err as { response?: { status?: number } })?.response?.status ?? 0;
          const message =
            err instanceof Error
              ? err.message
              : JSON.stringify(err).slice(0, 500);
          if (status === 400 || status === 401 || status === 403) {
            await markIntegrationBroken(
              integration.id,
              `Refresh failed (${status}): ${message}`,
            );
            broken++;
          } else {
            await prisma.integration.update({
              where: { id: integration.id },
              data: { lastRefreshError: message.slice(0, 500) },
            });
          }
        }
      });
    }

    return {
      candidates: integrations.length,
      refreshed,
      broken,
    };
  },
);
