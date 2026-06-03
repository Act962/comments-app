import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { ecosystemSyncNasa } from "@/lib/ecosystem-sync/nasa";

/**
 * Replica um `Member` do comments-app no NASA (best-effort, retry/backoff).
 * Evento: `sync/member.upsert`.
 *
 * AUTO-SUFICIENTE: além do Member, garante que User + Account(s) + Organization
 * existam no NASA, fazendo upsert NA ORDEM DE FK (user → accounts → org →
 * member). Assim qualquer rota que crie membro só precisa emitir o `memberId`.
 */
export const replicateMemberToNasa = inngest.createFunction(
  {
    id: "sync-replicate-member-to-nasa",
    retries: 5,
    triggers: { event: "sync/member.upsert" },
  },
  async ({ event, step }) => {
    const { memberId } = event.data as { memberId: string };

    // Carrega o grafo inteiro numa step só, montando os payloads enquanto as
    // datas ainda são `Date` reais do Prisma (numa step posterior elas viriam
    // reidratadas como string do JSON memoizado e `.toISOString()` quebraria).
    const memberGraph = await step.run("load-member-graph", async () => {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      });
      if (!member) return null;

      const [memberUser, parentOrg, userAccounts] = await Promise.all([
        prisma.user.findUnique({ where: { id: member.userId } }),
        prisma.organization.findUnique({
          where: { id: member.organizationId },
        }),
        prisma.account.findMany({ where: { userId: member.userId } }),
      ]);

      return {
        member: {
          id: member.id,
          organizationId: member.organizationId,
          userId: member.userId,
          role: member.role,
          createdAt: member.createdAt.toISOString(),
        },
        user: memberUser
          ? {
              id: memberUser.id,
              name: memberUser.name,
              email: memberUser.email,
              emailVerified: memberUser.emailVerified,
              image: memberUser.image,
              phone: null,
              createdAt: memberUser.createdAt.toISOString(),
              updatedAt: memberUser.updatedAt.toISOString(),
            }
          : null,
        org: parentOrg
          ? {
              id: parentOrg.id,
              name: parentOrg.name,
              slug: parentOrg.slug,
              logo: parentOrg.logo,
              metadata: parentOrg.metadata,
              createdAt: parentOrg.createdAt.toISOString(),
            }
          : null,
        accounts: userAccounts.map((account) => ({
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
        })),
      };
    });

    if (!memberGraph) return { skipped: "member_not_found", memberId };

    const { user, accounts, org, member } = memberGraph;

    // Ordem de FK: user → accounts → org → member. Cada upsert é idempotente
    // por id no inbound do NASA. (Os `const` locais preservam o narrowing do
    // `if` dentro do closure, dispensando non-null assertion.)
    if (user) {
      await step.run("upsert-user", () => ecosystemSyncNasa.upsertUser(user));
    }
    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
      const account = accounts[accountIndex];
      await step.run(`upsert-account-${accountIndex}`, () =>
        ecosystemSyncNasa.upsertAccount(account),
      );
    }
    if (org) {
      await step.run("upsert-org", () => ecosystemSyncNasa.upsertOrg(org));
    }
    await step.run("upsert-member", () =>
      ecosystemSyncNasa.upsertMember(member),
    );

    return { ok: true, memberId };
  },
);
