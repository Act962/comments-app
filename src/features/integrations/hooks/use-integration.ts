import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseIntegrations = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.integration.getIntegrations.queryOptions());
};
