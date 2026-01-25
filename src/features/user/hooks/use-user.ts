import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const useQueryPosts = () => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.user.getPosts.queryOptions());

  return {
    posts: data,
    isLoading: isPending,
  };
};
