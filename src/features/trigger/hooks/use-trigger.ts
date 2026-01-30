import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateTrigger = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.trigger.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Gatilho criado com sucesso");
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
    }),
  );
};

export const useDeleteTrigger = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.trigger.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success("Gatilho criado com sucesso");
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
    }),
  );
};
