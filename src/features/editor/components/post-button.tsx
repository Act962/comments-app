"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon } from "lucide-react";
import {
  useInfinitePosts,
  useQueryPosts,
} from "@/features/user/hooks/use-user";
import { useSavePost } from "@/features/automations/hooks/use-automations";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Post {
  postid: string;
  caption?: string;
  media: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

export function PostButton({ automationId }: { automationId: string }) {
  // const { posts, status } = useQueryPosts();
  const [selectedPost, setSelectedPost] = useState<Post[]>([]);
  const { posts, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts();
  const savePost = useSavePost();

  const onSelectPost = (post: Post) => {
    setSelectedPost((prev) => {
      if (prev.find((p) => p.postid === post.postid)) {
        return prev.filter((p) => p.postid !== post.postid);
      }
      return [...prev, post];
    });
  };
  const onSavePost = () => {
    savePost.mutate({
      automationId,
      posts: selectedPost.map((post) => ({
        postId: post.postid,
        media: post.media,
        mediaType: post.mediaType,
        caption: post.caption,
      })),
    });
  };

  const isDisabled = selectedPost.length === 0 || savePost.isPending;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <PlusIcon className="size-4" />
          Adicionar Post
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <div className="flex flex-col gap-y-3 w-full">
          <ScrollArea className="h-[300px] overflow-hidden">
            <div className="w-full">
              <div className="flex flex-wrap w-full gap-3">
                {posts.length > 0 ? (
                  posts.map((post) => {
                    const isSelected = selectedPost.find(
                      (p) => p.postid === post.id,
                    );

                    return (
                      <div
                        key={post.id}
                        className="relative w-1/3 aspect-square rounded-lg cursor-pointer overflow-hidden"
                        onClick={() =>
                          onSelectPost({
                            postid: post.id,
                            media: post.media_url,
                            mediaType: post.media_type,
                            caption: post.caption,
                          })
                        }
                      >
                        {isSelected && (
                          <CheckIcon className="size-5 z-10 absolute top-2 right-2 stroke-4" />
                        )}

                        {post.media_type === "IMAGE" && (
                          <img
                            src={post.media_url}
                            alt={post.caption ?? ""}
                            className={cn(
                              "object-fill size-full transition",
                              isSelected && "opacity-75",
                            )}
                          />
                        )}

                        {post.media_type === "VIDEO" && (
                          <video
                            src={post.media_url}
                            muted
                            className={cn(
                              "object-fill size-full transition",
                              isSelected && "opacity-75",
                            )}
                          />
                        )}

                        {post.media_type === "CAROUSEL_ALBUM" && (
                          <img
                            src={post.media_url}
                            alt={post.caption ?? ""}
                            className={cn(
                              "object-fill size-full transition",
                              isSelected && "opacity-75",
                            )}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground">
                    Nenhum post encontrado
                  </p>
                )}
              </div>

              {hasNextPage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage && <Spinner />}
                  Mais Posts
                </Button>
              )}
            </div>
          </ScrollArea>

          <Button onClick={onSavePost} disabled={isDisabled} className="w-full">
            {savePost.isPending && <Spinner />}
            Salvar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
