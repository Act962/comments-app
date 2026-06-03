import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import prisma from "./db";
import { stripeClient } from "./stripe";
import { PLAN_ENUM, PLANS } from "./constant";
import { createDefaultSubscription } from "@/actions/subscription";
import { inngest } from "@/inngest/client";
import {
  invitationEmail,
  resetPasswordEmail,
  sendEmail,
  verifyEmail,
} from "./email";

const APP_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      const template = resetPasswordEmail({ name: user.name, url });
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tag: "reset-password",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = verifyEmail({ name: user.name, url });
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tag: "verify-email",
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const firstName = user.name?.split(" ")[0]?.trim() || "Empresa";
          const slug = `empresa-${user.id.slice(0, 8).toLowerCase()}`;
          const org = await prisma.organization.create({
            data: {
              name: `Empresa de ${firstName}`,
              slug,
              createdAt: new Date(),
            },
          });
          const member = await prisma.member.create({
            data: {
              organizationId: org.id,
              userId: user.id,
              role: "owner",
              createdAt: new Date(),
            },
          });
          await createDefaultSubscription(org.id);

          // ── Sync de auth comments → NASA (best-effort) ──
          // user + org/member default são criados aqui via Prisma cru (fora dos
          // organizationHooks), então precisam ser emitidos explicitamente.
          // try/catch que só loga: NUNCA quebra o sign-up.
          try {
            await inngest.send({
              name: "sync/user.upsert",
              data: { userId: user.id },
            });
            await inngest.send({
              name: "sync/org.upsert",
              data: { organizationId: org.id },
            });
            await inngest.send({
              name: "sync/member.upsert",
              data: { memberId: member.id },
            });
          } catch (e) {
            console.error("[sync emit] user.create enqueue failed:", e);
          }
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          try {
            await inngest.send({
              name: "sync/account.upsert",
              data: { accountId: account.id },
            });
          } catch (e) {
            console.error("[sync emit] account.create enqueue failed:", e);
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const firstMember = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" },
            select: { organizationId: true },
          });
          if (!firstMember) return { data: session };
          return {
            data: {
              ...session,
              activeOrganizationId: firstMember.organizationId,
            },
          };
        },
      },
    },
  },
  plugins: [
    organization({
      creatorRole: "owner",
      organizationLimit: 10,
      membershipLimit: 50,
      allowUserToCreateOrganization: async (user) => {
        const ownedOrgs = await prisma.member.findMany({
          where: { userId: user.id, role: "owner" },
          select: { organizationId: true },
        });
        if (ownedOrgs.length === 0) return true;
        const hasPro = await prisma.subscription.findFirst({
          where: {
            referenceId: { in: ownedOrgs.map((o) => o.organizationId) },
            status: "active",
            plan: PLAN_ENUM.PRO,
          },
        });
        return Boolean(hasPro);
      },
      sendInvitationEmail: async (data) => {
        const link = `${APP_URL}/accept-invitation/${data.id}`;
        const template = invitationEmail({
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          inviterEmail: data.inviter.user.email,
          role: data.role,
          url: link,
        });
        await sendEmail({
          to: data.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          tag: "invitation",
        });
      },
      organizationHooks: {
        // ── Sync de auth comments → NASA (best-effort) ──
        // Só enfileira; replicação real com retry roda no Inngest.
        afterCreateOrganization: async ({ organization, member }) => {
          await createDefaultSubscription(organization.id);
          try {
            await inngest.send({
              name: "sync/org.upsert",
              data: { organizationId: organization.id },
            });
            if (member?.id) {
              await inngest.send({
                name: "sync/member.upsert",
                data: { memberId: member.id },
              });
            }
          } catch (e) {
            console.error("[sync emit] org.create enqueue failed:", e);
          }
        },
        afterAddMember: async ({ member }) => {
          try {
            await inngest.send({
              name: "sync/member.upsert",
              data: { memberId: member.id },
            });
          } catch (e) {
            console.error("[sync emit] member.add enqueue failed:", e);
          }
        },
        // better-auth NÃO dispara afterAddMember ao ACEITAR convite — só
        // afterAcceptInvitation. Sem este hook, membros que entram por convite
        // nunca replicariam pro NASA.
        afterAcceptInvitation: async ({ member }) => {
          try {
            await inngest.send({
              name: "sync/member.upsert",
              data: { memberId: member.id },
            });
          } catch (e) {
            console.error("[sync emit] member.accept enqueue failed:", e);
          }
        },
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: false,
      organization: {
        enabled: true,
      },
      subscription: {
        enabled: true,
        plans: PLANS,
        authorizeReference: async ({ user, referenceId, action }) => {
          const member = await prisma.member.findFirst({
            where: { organizationId: referenceId, userId: user.id },
            select: { role: true },
          });
          if (!member) return false;
          if (
            action === "upgrade-subscription" ||
            action === "cancel-subscription" ||
            action === "restore-subscription"
          ) {
            return member.role === "owner" || member.role === "admin";
          }
          return true;
        },
        getCheckoutSessionParams: async () => {
          return {
            params: {
              allow_promotion_codes: true,
            },
          };
        },
      },
    }),
  ],
});
