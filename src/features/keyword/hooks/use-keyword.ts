import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.keyword.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Palavra-chave adicionada com sucesso");
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
    }),
  );
};

export const useDeleteKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.keyword.delete.mutationOptions({
      onSuccess: (data) => {
        toast.success("Palavra-chave removida com sucesso");
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
    }),
  );
};
