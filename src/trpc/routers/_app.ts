import { createTRPCRouter } from "../init";
import { userRouter } from "@/features/user/server/route";
import { automationsRouter } from "@/features/automations/server/route";
import { listenerRouter } from "@/features/listener/server/route";
import { triggerRouter } from "@/features/trigger/server/route";
import { keywordRouter } from "@/features/keyword/server/route";
import { integrationRouter } from "@/features/integrations/server/route";
import { notificationsRouter } from "@/features/notifications/server/route";
import { subscriptionRouter } from "@/features/subscription/server/route";

export const appRouter = createTRPCRouter({
  user: userRouter,
  automations: automationsRouter,
  listener: listenerRouter,
  trigger: triggerRouter,
  keyword: keywordRouter,
  integration: integrationRouter,
  notifications: notificationsRouter,
  subscription: subscriptionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
