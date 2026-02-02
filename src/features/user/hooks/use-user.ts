import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useQueryPosts = () => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.user.getPosts.queryOptions());

  return {
    posts: data?.data,
    status: data?.status,
    isLoading: isPending,
  };
};

export const useUpdateProfile = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.user.updateProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Perfil atualizado com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao atualizar perfil");
      },
    }),
  );
};
