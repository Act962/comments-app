import prisma from "@/lib/db";
import { ecosystemSyncNasa } from "@/lib/ecosystem-sync/nasa";
import { inngest } from "@/inngest/client";

/**
 * Replica um `Account` do comments-app no NASA (best-effort, retry/backoff).
 * Como nenhum lado sobrescreve o hash de senha (scrypt default), o
 * `Account.password` replicado loga no NASA sem reset.
 * Evento: `sync/account.upsert` — emitido pelo hook `account.create.after`.
 */
export const replicateAccountToNasa = inngest.createFunction(
  {
    id: "sync-replicate-account-to-nasa",
    retries: 5,
    triggers: { event: "sync/account.upsert" },
  },
  async ({ event, step }) => {
    const accountId = (event.data as { accountId: string }).accountId;

    const payload = await step.run("load-account", async () => {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });
      if (!account) return null;
      return {
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
        userId: account.userId,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        idToken: account.idToken,
        accessTokenExpiresAt:
          account.accessTokenExpiresAt?.toISOString() ?? null,
        refreshTokenExpiresAt:
          account.refreshTokenExpiresAt?.toISOString() ?? null,
        scope: account.scope,
        password: account.password,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      };
    });
    if (!payload) return { skipped: "account_not_found", accountId };

    await step.run("upsert-to-nasa", () =>
      ecosystemSyncNasa.upsertAccount(payload),
    );
    return { ok: true, accountId };
  },
);
