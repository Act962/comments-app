import { createTRPCRouter } from "../init";
import { userRouter } from "@/features/user/server/route";
import { automationsRouter } from "@/features/automations/server/route";
import { listenerRouter } from "@/features/listener/server/route";
import { triggerRouter } from "@/features/trigger/server/route";
export const appRouter = createTRPCRouter({
  user: userRouter,
  automations: automationsRouter,
  listener: listenerRouter,
  trigger: triggerRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
