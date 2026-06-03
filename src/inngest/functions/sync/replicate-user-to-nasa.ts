import prisma from "@/lib/db";
import { ecosystemSyncNasa } from "@/lib/ecosystem-sync/nasa";
import { inngest } from "@/inngest/client";

/**
 * Replica um `User` do comments-app no NASA (best-effort, retry/backoff).
 * Evento: `sync/user.upsert` — emitido pelo hook `user.create.after`.
 *
 * O comments User não tem `phone` → enviado como `null` (o NASA tem o campo).
 */
export const replicateUserToNasa = inngest.createFunction(
  {
    id: "sync-replicate-user-to-nasa",
    retries: 5,
    triggers: { event: "sync/user.upsert" },
  },
  async ({ event, step }) => {
    const userId = (event.data as { userId: string }).userId;

    const payload = await step.run("load-user", async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        phone: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    });
    if (!payload) return { skipped: "user_not_found", userId };

    await step.run("upsert-to-nasa", () => ecosystemSyncNasa.upsertUser(payload));
    return { ok: true, userId };
  },
);
