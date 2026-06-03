import prisma from "@/lib/db";
import { ecosystemSyncNasa } from "@/lib/ecosystem-sync/nasa";
import { inngest } from "@/inngest/client";

/**
 * Replica uma `Organization` do comments-app no NASA (best-effort, retry/backoff).
 * Evento: `sync/org.upsert` — emitido por `afterCreateOrganization` e pelo
 * `user.create.after` (org default do signup).
 */
export const replicateOrgToNasa = inngest.createFunction(
  {
    id: "sync-replicate-org-to-nasa",
    retries: 5,
    triggers: { event: "sync/org.upsert" },
  },
  async ({ event, step }) => {
    const organizationId = (event.data as { organizationId: string })
      .organizationId;

    const payload = await step.run("load-org", async () => {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) return null;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        metadata: org.metadata,
        createdAt: org.createdAt.toISOString(),
      };
    });
    if (!payload) return { skipped: "org_not_found", organizationId };

    await step.run("upsert-to-nasa", () => ecosystemSyncNasa.upsertOrg(payload));
    return { ok: true, organizationId };
  },
);
