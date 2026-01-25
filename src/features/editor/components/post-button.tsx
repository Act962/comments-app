"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useQueryPosts } from "@/features/user/hooks/use-user";
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

interface Post {
  postid: string;
  caption?: string;
  media: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM";
}

export function PostButton({ automationId }: { automationId: string }) {
  const { posts, status } = useQueryPosts();
  const [selectedPost, setSelectedPost] = useState<Post[]>([]);
  const savePost = useSavePost();

  const onSelectPost = (post: Post) => {
    setSelectedPost((prev) => [...prev, post]);
  };

  const onRemovePost = (post: Post) => {
    setSelectedPost((prev) => prev.filter((p) => p.postid !== post.postid));
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
        {status === 200 ? (
          <div className="flex flex-col gap-y-3 w-full">
            <div className="flex flex-wrap w-full gap-3">
              {posts?.map((post) => (
                <div
                  className="relative w-4/12 aspect-square rounded-lg cursor-pointer overflow-hidden"
                  key={post.id}
                  onClick={() =>
                    onSelectPost({
                      postid: post.id,
                      media: post.media_url,
                      mediaType: post.media_type,
                      caption: post.caption,
                    })
                  }
                >
                  {selectedPost.find((p) => p.postid === post.id) && (
                    <CheckIcon className="size-4" fill="white" stroke="black" />
                  )}
                  {/* <Image
                  fill
                  sizes="100vw"
                  src={post.media_url}
                  alt={"post image"}
                  className={cn(
                    "object-fill size-full hover:opacity-75 transition duration-100",
                    selectedPost.find((p) => p.postid === post.id) &&
                      "opacity-75",
                  )}
                /> */}
                  <img
                    src={post.media_url}
                    alt={"post image"}
                    className={cn(
                      "object-fill size-full hover:opacity-75 transition duration-100",
                      selectedPost.find((p) => p.postid === post.id) &&
                        "opacity-75",
                    )}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={onSavePost}
              disabled={isDisabled}
              className="w-full"
            >
              {savePost.isPending && <Spinner />}
              Salvar
            </Button>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhum post encontrado
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
