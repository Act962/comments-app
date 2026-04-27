import { automationsRouter } from "@/features/automations/server/route";
import { integrationRouter } from "@/features/integrations/server/route";
import { keywordRouter } from "@/features/keyword/server/route";
import { listenerRouter } from "@/features/listener/server/route";
import { notificationsRouter } from "@/features/notifications/server/route";
import { sorteioPublicRouter } from "@/features/sorteio/server/public-route";
import { sorteioRouter } from "@/features/sorteio/server/route";
import { subscriptionRouter } from "@/features/subscription/server/route";
import { triggerRouter } from "@/features/trigger/server/route";
import { userRouter } from "@/features/user/server/route";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  user: userRouter,
  automations: automationsRouter,
  listener: listenerRouter,
  trigger: triggerRouter,
  keyword: keywordRouter,
  integration: integrationRouter,
  notifications: notificationsRouter,
  subscription: subscriptionRouter,
  sorteio: sorteioRouter,
  sorteioPublic: sorteioPublicRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
