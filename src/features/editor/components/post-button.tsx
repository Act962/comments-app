"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useQueryPosts } from "@/features/user/hooks/use-user";

interface Post {
  postid: string;
  caption?: string;
  media: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM";
}

export function PostButton() {
  const { posts } = useQueryPosts();

  return (
    <Button variant="outline" className="w-full border-dashed">
      <PlusIcon className="size-4" />
      Adicionar post
    </Button>
  );
}
