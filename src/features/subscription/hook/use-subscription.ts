import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpgradeSubscription = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.subscription.upgrade.mutationOptions({
      onSuccess: (data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

export const useCurrentSubscription = () => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.subscription.currentSubscription.queryOptions(),
  );

  return {
    subscription: data ?? null,
    isLoading: isPending,
  };
};
