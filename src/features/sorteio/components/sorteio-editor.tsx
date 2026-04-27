"use client";

import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteSorteio, useSuspenseSorteio } from "../hooks/use-sorteios";
import { CommentsTable } from "./comments-table";
import { DrawPanel } from "./draw-panel";
import { PostPicker } from "./post-picker";
import { PrizeForm } from "./prize-form";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  COLLECTING: "Coletando",
  CLOSED: "Coleta encerrada",
  DRAWN: "Sorteado",
};

export const SorteioEditor = ({ id }: { id: string }) => {
  const { data: sorteio } = useSuspenseSorteio(id);
  const router = useRouter();
  const deleteSorteio = useDeleteSorteio();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{sorteio.title}</h1>
            <Badge variant="secondary">
              {STATUS_LABEL[sorteio.status] ?? sorteio.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {sorteio._count.comments} comentário
            {sorteio._count.comments === 1 ? "" : "s"} •{" "}
            {sorteio.winners.length}/{sorteio.winnersCount} ganhador
            {sorteio.winnersCount === 1 ? "" : "es"}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <TrashIcon className="size-4" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir sorteio?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os comentários, posts e ganhadores deste sorteio serão
                removidos. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteSorteio.mutate(
                    { id: sorteio.id },
                    { onSuccess: () => router.push("/sorteios") },
                  )
                }
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="prize" className="w-full">
        <TabsList>
          <TabsTrigger value="prize">Prêmio</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
          <TabsTrigger value="draw">Sorteio</TabsTrigger>
        </TabsList>

        <TabsContent value="prize" className="mt-4">
          <PrizeForm
            sorteio={{
              id: sorteio.id,
              title: sorteio.title,
              prizeName: sorteio.prizeName,
              prizeDescription: sorteio.prizeDescription,
              prizeImage: sorteio.prizeImage,
              winnersCount: sorteio.winnersCount,
            }}
          />
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <PostPicker
            sorteioId={sorteio.id}
            selectedPosts={sorteio.posts}
            disabled={sorteio.status === "DRAWN"}
          />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentsTable
            sorteioId={sorteio.id}
            totalComments={sorteio._count.comments}
          />
        </TabsContent>

        <TabsContent value="draw" className="mt-4">
          <DrawPanel sorteio={sorteio} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
