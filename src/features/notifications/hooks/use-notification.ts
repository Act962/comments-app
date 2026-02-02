import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseNotifications = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.notifications.getMany.queryOptions());
};

export const useQueryNotifications = () => {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.notifications.getMany.queryOptions(),
  );

  return {
    notifications: data ?? [],
    isLoading,
    error,
  };
};
