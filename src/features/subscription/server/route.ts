import { getEffectivePlan } from "@/actions/subscription";
import { auth } from "@/lib/auth";
import { PLAN_ENUM, PLANS } from "@/lib/constant";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedOrgProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";

export const subscriptionRouter = createTRPCRouter({
  upgrade: protectedOrgProcedure
    .input(
      z.object({
        plan: z.enum([PLAN_ENUM.PRO]),
        callbackUrl: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const effective = await getEffectivePlan(ctx.organizationId);

      if (effective.plan === input.plan && effective.isInherited) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: effective.sourceOrganizationName
            ? `Esta empresa já está no plano ${input.plan} pela assinatura da empresa ${effective.sourceOrganizationName}.`
            : `Esta empresa já está no plano ${input.plan} por herança de outra empresa do mesmo dono.`,
        });
      }

      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          referenceId: ctx.organizationId,
          status: "active",
        },
      });

      if (existingSubscription?.plan === input.plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já está nesse plano",
        });
      }

      const data = await auth.api.upgradeSubscription({
        body: {
          plan: input.plan,
          referenceId: ctx.organizationId,
          customerType: "organization",
          successUrl: `${input.callbackUrl}?success=true`,
          cancelUrl: `${input.callbackUrl}?success=false`,
          disableRedirect: true,
          ...(existingSubscription?.status === "active" &&
          existingSubscription.stripeSubscriptionId
            ? { subscriptionId: existingSubscription.stripeSubscriptionId }
            : {}),
        },
        headers: await headers(),
      });

      return {
        success: true,
        checkoutUrl: data.url,
      };
    }),

  billingPortal: protectedOrgProcedure
    .input(z.object({ callbackUrl: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const effective = await getEffectivePlan(ctx.organizationId);

      if (effective.isInherited) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: effective.sourceOrganizationName
            ? `A cobrança é gerenciada pela empresa ${effective.sourceOrganizationName}. Troque para ela no seletor para abrir o portal.`
            : "A cobrança é gerenciada por outra empresa do mesmo dono. Troque para ela no seletor para abrir o portal.",
        });
      }

      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          referenceId: ctx.organizationId,
          status: "active",
        },
      });

      if (!existingSubscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const data = await auth.api.createBillingPortal({
        body: {
          referenceId: existingSubscription.referenceId,
          customerType: "organization",
          returnUrl: input.callbackUrl,
          disableRedirect: true,
        },
        headers: await headers(),
      });

      return {
        success: true,
        checkoutUrl: data.url,
      };
    }),

  currentSubscription: protectedOrgProcedure.query(async ({ ctx }) => {
    const effective = await getEffectivePlan(ctx.organizationId);

    const plan = PLANS.find((p) => p.name === effective.plan);
    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan not found",
      });
    }

    // Carrega a Subscription "vigente" pra retornar — se herdado, devolve a da
    // empresa-fonte (assim o `subscription.plan` no front coincide com o que o
    // usuário enxerga); senão, a da própria empresa.
    const subscriptionRecord = await prisma.subscription.findFirst({
      where: {
        referenceId: effective.sourceOrganizationId,
        status: "active",
      },
    });

    if (!subscriptionRecord) {
      return null;
    }

    return {
      subscription: subscriptionRecord,
      plan,
      isInherited: effective.isInherited,
      sourceOrganization: effective.isInherited
        ? {
            id: effective.sourceOrganizationId,
            name: effective.sourceOrganizationName,
          }
        : null,
    };
  }),
});
