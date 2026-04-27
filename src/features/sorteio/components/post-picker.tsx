"use client";

import { AlertCircleIcon, Trash2Icon } from "lucide-react";
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

type SorteioPost = {
  id: string;
  postId: string;
  caption: string | null;
  media: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
};

type Props = {
  sorteioId: string;
  selectedPosts: SorteioPost[];
  disabled?: boolean;
};

export const PostPicker = ({ sorteioId, selectedPosts, disabled }: Props) => {
  const media = useInstagramMedia();
  const addPosts = useAddSorteioPosts();
  const removePost = useRemoveSorteioPost(sorteioId);
  const [picked, setPicked] = useState<Set<string>>(new Set());

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
                  <div className="relative size-14 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={post.media}
                      alt={post.caption ?? "Post"}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
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
              Selecione publicações da sua conta Instagram conectada.
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
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => togglePick(m.id)}
                      className={`group relative aspect-square overflow-hidden rounded-md border text-left ${
                        isPicked
                          ? "ring-2 ring-primary"
                          : "hover:ring-1 hover:ring-muted-foreground/40"
                      }`}
                    >
                      <Image
                        src={thumb}
                        alt={m.caption ?? "Mídia"}
                        fill
                        sizes="(min-width: 640px) 200px, 50vw"
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute left-2 top-2">
                        <Checkbox checked={isPicked} />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="line-clamp-1 text-xs text-white">
                          {m.media_type}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
