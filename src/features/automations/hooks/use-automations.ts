import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseAutomations = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.automations.getMany.queryOptions());
};

export const useQueryAutomations = () => {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(trpc.automations.getMany.queryOptions());

  return {
    automations: data ?? [],
    isLoading,
  };
};

export const useSuspenseAutomation = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.automations.getOne.queryOptions({ id }));
};

export const useQueryAutomation = (id: string) => {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.automations.getOne.queryOptions({ id }),
  );

  return {
    automation: data ?? null,
    isLoading,
  };
};

export const userCreateAutomation = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.automations.create.mutationOptions({
      onSuccess: () => {
        toast.success("Automação criada com sucesso");
        queryClient.invalidateQueries(trpc.automations.getMany.queryOptions());
      },
      onError: () => {
        toast.error("Erro ao criar automação");
      },
    }),
  );
};

export const useUpdateAutomationName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.automations.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success("Automação atualizada com sucesso");
        queryClient.invalidateQueries(trpc.automations.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.automations.getOne.queryOptions({
            id: data.id,
          }),
        );
      },
      onError: () => {
        toast.error("Erro ao atualizar automação");
      },
    }),
  );
};
