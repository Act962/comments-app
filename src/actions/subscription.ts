import { PLAN_ENUM } from "@/lib/constant";
import prisma from "@/lib/db";

export async function createDefaultSubscription(
  userId: string,
  stripeCustomerId: string,
) {
  try {
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        referenceId: userId,
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
        referenceId: userId,
        plan: PLAN_ENUM.FREE,
        stripeCustomerId: stripeCustomerId,
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
