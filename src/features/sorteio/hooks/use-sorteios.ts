import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useSuspenseSorteios = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.sorteio.getMany.queryOptions());
};

export const useQuerySorteios = () => {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.sorteio.getMany.queryOptions());
  return { sorteios: data ?? [], isLoading };
};

export const useSuspenseSorteio = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.sorteio.getOne.queryOptions({ id }));
};

export const useCreateSorteio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.create.mutationOptions({
      onSuccess: () => {
        toast.success("Sorteio criado");
        queryClient.invalidateQueries(trpc.sorteio.getMany.queryOptions());
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useUpdateSorteio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.update.mutationOptions({
      onSuccess: (data) => {
        toast.success("Sorteio atualizado");
        queryClient.invalidateQueries(trpc.sorteio.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useDeleteSorteio = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Sorteio removido");
        queryClient.invalidateQueries(trpc.sorteio.getMany.queryOptions());
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useAddSorteioPosts = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.addPosts.mutationOptions({
      onSuccess: (data) => {
        toast.success("Posts adicionados");
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: data.sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useRemoveSorteioPost = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.removePost.mutationOptions({
      onSuccess: () => {
        toast.success("Post removido");
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useStartCollecting = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.startCollecting.mutationOptions({
      onSuccess: (stats) => {
        const failed = stats.perPost.filter((p) => p.error).length;
        if (failed > 0) {
          toast.warning(
            `Coleta iniciada. ${stats.totalUpserted} comentários (${failed} posts com erro)`,
          );
        } else {
          toast.success(
            `Coleta iniciada — ${stats.totalUpserted} comentários importados`,
          );
        }
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
        queryClient.invalidateQueries(
          trpc.sorteio.listComments.infiniteQueryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useCloseCollecting = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.closeCollecting.mutationOptions({
      onSuccess: () => {
        toast.success("Coleta encerrada");
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useResyncSorteio = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.resync.mutationOptions({
      onSuccess: (stats) => {
        toast.success(
          `Sincronização concluída — ${stats.totalUpserted} comentários`,
        );
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
        queryClient.invalidateQueries(
          trpc.sorteio.listComments.infiniteQueryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useInfiniteSorteioComments = (sorteioId: string) => {
  const trpc = useTRPC();

  return useInfiniteQuery(
    trpc.sorteio.listComments.infiniteQueryOptions(
      { id: sorteioId, limit: 50 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    ),
  );
};

export const useDrawSorteio = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.draw.mutationOptions({
      onSuccess: (winners) => {
        toast.success(`Sorteado: ${winners.length} ganhador(es)`);
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useInstagramMedia = () => {
  const trpc = useTRPC();
  return useQuery(
    trpc.sorteioPublic.listInstagramMedia.queryOptions(undefined, {
      retry: false,
    }),
  );
};

export const useReplaceWinner = (sorteioId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.sorteio.replaceWinner.mutationOptions({
      onSuccess: () => {
        toast.success("Ganhador substituído");
        queryClient.invalidateQueries(
          trpc.sorteio.getOne.queryOptions({ id: sorteioId }),
        );
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};
