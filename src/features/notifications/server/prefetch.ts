import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.notifications.getMany>;

export function prefetchNotifications(params: Input) {
  prefetch(trpc.notifications.getMany.queryOptions(params));
}
