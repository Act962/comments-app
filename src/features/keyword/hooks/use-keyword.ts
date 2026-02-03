import { Keyword } from "@/generated/prisma/client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.keyword.create.mutationOptions({
      onMutate: async (data) => {
        const previousData = queryClient.getQueryData<Keyword[]>([
          "keyword.list",
          data.automationId,
        ]);

        queryClient.setQueryData(
          ["keyword.list", data.automationId],
          (old: any) => {
            if (!old) return undefined;

            return [...old, data];
          },
        );

        return { previousData };
      },
      onSuccess: (data) => {
        toast.success("Palavra-chave adicionada com sucesso");
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.automationId!,
          }),
        );
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["keyword.list", _variables.automationId],
            context.previousData,
          );
        }
        toast.error("Erro ao adicionar palavra-chave");
      },
    }),
  );
};

export const useDeleteKeyword = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.keyword.delete.mutationOptions({
      onMutate: async (data) => {
        const previousData = queryClient.getQueryData<Keyword[]>([
          "keyword.list",
          data.automationId,
        ]);

        queryClient.setQueryData(
          ["keyword.list", data.automationId],
          (old: any) => {
            if (!old) return undefined;

            return old.filter((keyword: Keyword) => keyword.id !== data.id);
          },
        );

        return { previousData };
      },
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
