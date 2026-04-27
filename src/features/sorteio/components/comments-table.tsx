"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInfiniteSorteioComments,
  useResyncSorteio,
} from "../hooks/use-sorteios";

type Props = {
  sorteioId: string;
  totalComments: number;
};

export const CommentsTable = ({ sorteioId, totalComments }: Props) => {
  const query = useInfiniteSorteioComments(sorteioId);
  const resync = useResyncSorteio(sorteioId);

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const firstPage = query.data?.pages[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Comentários coletados</CardTitle>
          <CardDescription>
            Comentários capturados dos posts selecionados (via backfill ou
            webhook em tempo real).
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {firstPage?.total ?? totalComments} total
          </Badge>
          {firstPage && (
            <Badge variant="secondary">{firstPage.uniqueUsers} únicos</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={resync.isPending}
            onClick={() => resync.mutate({ id: sorteioId })}
          >
            {resync.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Resincronizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {query.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!query.isLoading && items.length === 0 && (
          <Empty>
            <EmptyTitle>Sem comentários ainda</EmptyTitle>
            <EmptyDescription>
              Inicie a coleta para importar os comentários existentes ou aguarde
              novos comentários no Instagram.
            </EmptyDescription>
          </Empty>
        )}

        {items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead className="w-44">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.fromUsername ? `@${c.fromUsername}` : c.fromId}
                  </TableCell>
                  <TableCell className="max-w-md whitespace-pre-wrap">
                    {c.text}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(c.commentedAt), "dd/MM/yy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {query.hasNextPage && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              disabled={query.isFetchingNextPage}
              onClick={() => query.fetchNextPage()}
            >
              {query.isFetchingNextPage && <Spinner className="size-4" />}
              Carregar mais
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
