import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useQueryPosts = () => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.user.getPosts.queryOptions({}));

  return {
    posts: data?.items,
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

export const useInfinitePosts = () => {
  const trpc = useTRPC();

  const query = trpc.user.getPosts.infiniteQueryOptions(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(query);

  const posts =
    data?.pages
      .flatMap((page) => page.items ?? [])
      .filter((p) => {
        if (!p) return false;
        const post = p as {
          id?: unknown;
          media_type?: unknown;
          media_url?: unknown;
        };
        return (
          typeof post.id === "string" &&
          typeof post.media_url === "string" &&
          (post.media_type === "IMAGE" ||
            post.media_type === "VIDEO" ||
            post.media_type === "CAROUSEL_ALBUM")
        );
      }) ?? [];

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};
