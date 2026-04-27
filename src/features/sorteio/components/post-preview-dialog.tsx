"use client";

import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewPost = {
  postId: string;
  caption?: string | null;
  media: string;
  mediaUrl?: string | null;
  permalink?: string | null;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
};

const MEDIA_TYPE_LABEL: Record<PreviewPost["mediaType"], string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  CAROUSEL_ALBUM: "Carrossel",
};

export const PostPreviewDialog = ({
  post,
  open,
  onOpenChange,
}: {
  post: PreviewPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] sm:max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 p-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            Visualização do post
            {post && (
              <Badge variant="secondary">
                {MEDIA_TYPE_LABEL[post.mediaType]}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Confira o post antes de adicioná-lo ao sorteio.
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 pb-6">
            <div className="flex max-h-[50vh] w-full shrink-0 justify-center overflow-hidden rounded-md bg-muted">
              {post.mediaType === "VIDEO" && post.mediaUrl ? (
                // biome-ignore lint/a11y/useMediaCaption: instagram media without captions
                <video
                  controls
                  src={post.mediaUrl}
                  poster={post.media}
                  className="max-h-[50vh] w-auto bg-black object-contain"
                />
              ) : (
                <Image
                  src={post.mediaUrl ?? post.media}
                  alt={post.caption ?? "Post"}
                  width={1080}
                  height={1080}
                  sizes="(min-width: 768px) 640px, 100vw"
                  className="max-h-[50vh] w-auto object-contain"
                  unoptimized
                />
              )}
            </div>

            {post.caption && (
              <div className="min-h-0 flex-1 overflow-y-auto rounded-md border p-3">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {post.caption}
                </p>
              </div>
            )}

            {post.permalink && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full shrink-0"
              >
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="size-4" />
                  Ver no Instagram
                </a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
