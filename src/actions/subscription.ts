import { PLAN_ENUM } from "@/lib/constant";
import prisma from "@/lib/db";

export async function createDefaultSubscription(organizationId: string) {
  try {
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        referenceId: organizationId,
      },
    });

    if (existingSubscription) {
      return {
        success: true,
        subscription: existingSubscription,
      };
    }

    const subscription = await prisma.subscription.create({
      data: {
        referenceId: organizationId,
        plan: PLAN_ENUM.FREE,
        status: "active",
      },
    });

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Failed to create subscription",
    };
  }
}

const ACTIVE_STATUSES = ["active", "trialing"] as const;

/**
 * Resolve o "plano efetivo" de uma empresa.
 *
 * Regra de negócio: o plano segue o dono. Se o dono de uma empresa B já paga
 * `pro` em outra empresa A que ele também é dono, então B herda `pro`. Assim
 * um único pagamento cobre todas as empresas do mesmo dono.
 *
 * Hierarquia de resolução:
 * 1. Se a própria empresa já tem assinatura ativa, ela vence (não-inherited).
 *    Isso preserva o caso em que essa empresa É a fonte do pagamento.
 * 2. Senão, procura entre as outras empresas que pertencem ao mesmo dono a
 *    assinatura ativa de maior nível (`pro` > `free`).
 * 3. Se nada herdável, cai pra Subscription da própria empresa (free/inactive).
 */
export type EffectivePlan = {
  plan: string;
  status: string;
  sourceOrganizationId: string;
  sourceOrganizationName: string | null;
  isInherited: boolean;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
};

export async function getEffectivePlan(
  organizationId: string,
): Promise<EffectivePlan> {
  const self = await prisma.subscription.findFirst({
    where: { referenceId: organizationId, status: { in: [...ACTIVE_STATUSES] } },
    orderBy: { periodEnd: "desc" },
  });

  if (self && self.plan !== PLAN_ENUM.FREE) {
    return {
      plan: self.plan,
      status: self.status ?? "active",
      sourceOrganizationId: organizationId,
      sourceOrganizationName: null,
      isInherited: false,
      stripeSubscriptionId: self.stripeSubscriptionId ?? null,
      stripeCustomerId: self.stripeCustomerId ?? null,
    };
  }

  const owner = await prisma.member.findFirst({
    where: { organizationId, role: "owner" },
    select: { userId: true },
  });

  if (owner) {
    const otherOwnedOrgIds = (
      await prisma.member.findMany({
        where: {
          userId: owner.userId,
          role: "owner",
          organizationId: { not: organizationId },
        },
        select: { organizationId: true },
      })
    ).map((m) => m.organizationId);

    if (otherOwnedOrgIds.length) {
      const inheritable = await prisma.subscription.findFirst({
        where: {
          referenceId: { in: otherOwnedOrgIds },
          plan: { not: PLAN_ENUM.FREE },
          status: { in: [...ACTIVE_STATUSES] },
        },
        orderBy: { periodEnd: "desc" },
      });

      if (inheritable) {
        const sourceOrg = await prisma.organization.findUnique({
          where: { id: inheritable.referenceId },
          select: { name: true },
        });
        return {
          plan: inheritable.plan,
          status: inheritable.status ?? "active",
          sourceOrganizationId: inheritable.referenceId,
          sourceOrganizationName: sourceOrg?.name ?? null,
          isInherited: true,
          stripeSubscriptionId: inheritable.stripeSubscriptionId ?? null,
          stripeCustomerId: inheritable.stripeCustomerId ?? null,
        };
      }
    }
  }

  return {
    plan: self?.plan ?? PLAN_ENUM.FREE,
    status: self?.status ?? "active",
    sourceOrganizationId: organizationId,
    sourceOrganizationName: null,
    isInherited: false,
    stripeSubscriptionId: self?.stripeSubscriptionId ?? null,
    stripeCustomerId: self?.stripeCustomerId ?? null,
  };
}
