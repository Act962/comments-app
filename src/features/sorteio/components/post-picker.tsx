"use client";

import { AlertCircleIcon, EyeIcon, PlayIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useAddSorteioPosts,
  useInstagramMedia,
  useRemoveSorteioPost,
} from "../hooks/use-sorteios";
import { PostPreviewDialog } from "./post-preview-dialog";

type SorteioPost = {
  id: string;
  postId: string;
  caption: string | null;
  media: string;
  mediaUrl: string | null;
  permalink: string | null;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
};

type Props = {
  sorteioId: string;
  selectedPosts: SorteioPost[];
  disabled?: boolean;
};

type PreviewState = {
  postId: string;
  caption?: string | null;
  media: string;
  mediaUrl?: string | null;
  permalink?: string | null;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
} | null;

export const PostPicker = ({ sorteioId, selectedPosts, disabled }: Props) => {
  const media = useInstagramMedia();
  const addPosts = useAddSorteioPosts();
  const removePost = useRemoveSorteioPost(sorteioId);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<PreviewState>(null);

  const selectedIds = useMemo(
    () => new Set(selectedPosts.map((p) => p.postId)),
    [selectedPosts],
  );

  const candidates = useMemo(
    () => (media.data ?? []).filter((m) => !selectedIds.has(m.id)),
    [media.data, selectedIds],
  );

  const togglePick = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onAdd = () => {
    if (picked.size === 0) return;
    const items = (media.data ?? [])
      .filter((m) => picked.has(m.id))
      .map((m) => ({
        postId: m.id,
        caption: m.caption,
        media: m.thumbnail_url ?? m.media_url,
        mediaUrl: m.media_url,
        permalink: m.permalink,
        mediaType: m.media_type,
      }));

    addPosts.mutate(
      { id: sorteioId, posts: items },
      {
        onSuccess: () => setPicked(new Set()),
      },
    );
  };

  return (
    <>
      <PostPreviewDialog
        post={preview}
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Posts no sorteio</CardTitle>
              <CardDescription>
                Comentários desses posts serão capturados e usados no sorteio.
              </CardDescription>
            </div>
            <Badge variant="secondary">{selectedPosts.length}</Badge>
          </CardHeader>
          <CardContent>
            {selectedPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum post adicionado ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedPosts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-3 rounded-md border p-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          postId: post.postId,
                          caption: post.caption,
                          media: post.media,
                          mediaUrl: post.mediaUrl,
                          permalink: post.permalink,
                          mediaType: post.mediaType,
                        })
                      }
                      className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted ring-offset-background transition hover:ring-2 hover:ring-primary hover:ring-offset-2"
                      title="Visualizar post"
                    >
                      <Image
                        src={post.media}
                        alt={post.caption ?? "Post"}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                      {post.mediaType === "VIDEO" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <PlayIcon className="size-5 text-white" />
                        </div>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {post.mediaType}
                      </p>
                      <p className="line-clamp-2 text-sm">
                        {post.caption ?? "Sem legenda"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar post"
                      onClick={() =>
                        setPreview({
                          postId: post.postId,
                          caption: post.caption,
                          media: post.media,
                          mediaUrl: post.mediaUrl,
                          permalink: post.permalink,
                          mediaType: post.mediaType,
                        })
                      }
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Remover post"
                      disabled={disabled || removePost.isPending}
                      onClick={() =>
                        removePost.mutate({
                          id: sorteioId,
                          postId: post.postId,
                        })
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Adicionar posts</CardTitle>
              <CardDescription>
                Clique para selecionar e use o ícone para visualizar a mídia.
              </CardDescription>
            </div>
            <Button
              size="sm"
              disabled={picked.size === 0 || addPosts.isPending || disabled}
              onClick={onAdd}
            >
              {addPosts.isPending && <Spinner className="size-4" />}
              Adicionar ({picked.size})
            </Button>
          </CardHeader>
          <CardContent>
            {media.isLoading && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                    key={i}
                    className="aspect-square w-full"
                  />
                ))}
              </div>
            )}

            {media.error && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>Não foi possível listar as mídias</AlertTitle>
                <AlertDescription>{media.error.message}</AlertDescription>
              </Alert>
            )}

            {!media.isLoading && !media.error && candidates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma mídia disponível para adicionar.
              </p>
            )}

            {candidates.length > 0 && (
              <ScrollArea className="h-96">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {candidates.map((m) => {
                    const isPicked = picked.has(m.id);
                    const thumb = m.thumbnail_url ?? m.media_url;
                    return (
                      <div
                        key={m.id}
                        className={`group relative aspect-square overflow-hidden rounded-md border ${
                          isPicked
                            ? "ring-2 ring-primary"
                            : "hover:ring-1 hover:ring-muted-foreground/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePick(m.id)}
                          className="absolute inset-0 text-left"
                          title={
                            isPicked ? "Desmarcar" : "Selecionar para o sorteio"
                          }
                        >
                          <Image
                            src={thumb}
                            alt={m.caption ?? "Mídia"}
                            fill
                            sizes="(min-width: 640px) 200px, 50vw"
                            className="object-cover"
                            unoptimized
                          />
                        </button>

                        <div className="pointer-events-none absolute left-2 top-2">
                          <Checkbox checked={isPicked} />
                        </div>

                        {m.media_type === "VIDEO" && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black/50 p-2">
                              <PlayIcon className="size-5 text-white" />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview({
                              postId: m.id,
                              caption: m.caption,
                              media: thumb,
                              mediaUrl: m.media_url,
                              permalink: m.permalink,
                              mediaType: m.media_type,
                            });
                          }}
                          title="Visualizar post"
                          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                        >
                          <EyeIcon className="size-4" />
                        </button>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="line-clamp-1 text-xs text-white">
                            {m.media_type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
