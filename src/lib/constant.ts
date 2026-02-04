export const PLAN_ENUM = {
  FREE: "free",
  PRO: "pro",
} as const;

export type PlanEnumType = (typeof PLAN_ENUM)[keyof typeof PLAN_ENUM];

export type PaidPlanEnumType = Exclude<PlanEnumType, "free">;

export const UPGRADEABLE_PLANS = [PLAN_ENUM.PRO];

const PRO_PRICE_ID = process.env.STRIPE_PRO_PLAN_ID!;

export const PLANS = [
  {
    id: 1,
    name: PLAN_ENUM.FREE,
    price: 0,
    priceId: undefined,
    features: [
      "1 automation",
      "100 messages/month",
      "100 comments/month",
      "100 dms/month",
    ],
  },
  {
    id: 2,
    name: PLAN_ENUM.PRO,
    price: 79.9,
    priceId: PRO_PRICE_ID,
    features: [
      "10 automations",
      "1000 messages/month",
      "1000 comments/month",
      "1000 dms/month",
    ],
  },
];
