import { prefetch, trpc } from "@/trpc/server";

export function prefetchIntegrations() {
  return prefetch(trpc.integration.getIntegrations.queryOptions());
}
