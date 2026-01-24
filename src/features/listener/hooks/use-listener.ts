import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateListener = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.listener.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
    }),
  );
};
