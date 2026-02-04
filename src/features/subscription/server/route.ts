import { auth } from "@/lib/auth";
import { PLAN_ENUM, PLANS } from "@/lib/constant";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { z } from "zod";

export const subscriptionRouter = createTRPCRouter({
  upgrade: protectedProcedure
    .input(
      z.object({
        plan: z.enum([PLAN_ENUM.PRO]),
        callbackUrl: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          referenceId: ctx.auth.user.id,
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

  billingPortal: protectedProcedure
    .input(z.object({ callbackUrl: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          referenceId: ctx.auth.user.id,
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

  currentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.subscription.findFirst({
      where: {
        referenceId: ctx.auth.user.id,
        status: "active",
      },
    });

    if (!subscription) {
      return null;
    }

    const plan = PLANS.find((plan) => plan.name === subscription.plan);

    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan not found",
      });
    }

    return {
      subscription,
      plan,
    };
  }),
});
