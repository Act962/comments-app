"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ExternalLinkIcon,
  PlayIcon,
  RefreshCwIcon,
  SquareIcon,
  TrophyIcon,
} from "lucide-react";
import Link from "next/link";
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
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  useCloseCollecting,
  useDrawSorteio,
  useReplaceWinner,
  useStartCollecting,
} from "../hooks/use-sorteios";

type Winner = {
  id: string;
  position: number;
  drawnAt: Date | string;
  comment: {
    id: string;
    text: string;
    fromId: string;
    fromUsername: string | null;
    commentedAt: Date | string;
  };
};

type Props = {
  sorteio: {
    id: string;
    slug: string;
    status: "DRAFT" | "COLLECTING" | "CLOSED" | "DRAWN";
    winnersCount: number;
    winners: Winner[];
  };
};

export const DrawPanel = ({ sorteio }: Props) => {
  const drawn = sorteio.winners.length;
  const remaining = sorteio.winnersCount - drawn;
  const progress = (drawn / sorteio.winnersCount) * 100;

  const startCollecting = useStartCollecting(sorteio.id);
  const closeCollecting = useCloseCollecting(sorteio.id);
  const draw = useDrawSorteio(sorteio.id);
  const replaceWinner = useReplaceWinner(sorteio.id);

  const canDraw =
    (sorteio.status === "COLLECTING" || sorteio.status === "CLOSED") &&
    remaining > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Sorteio</CardTitle>
              <CardDescription>
                Controle a coleta e execute os sorteios. Quem já foi sorteado
                nunca é selecionado de novo.
              </CardDescription>
            </div>
            <Button variant="link" size="sm" asChild>
              <Link href={`/sorteio/${sorteio.slug}`} target="_blank">
                <ExternalLinkIcon className="size-4" />
                Página pública
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {drawn}/{sorteio.winnersCount} ganhador
                {sorteio.winnersCount === 1 ? "" : "es"} sorteado
                {drawn === 1 ? "" : "s"}
              </span>
              <Badge
                variant={sorteio.status === "DRAWN" ? "default" : "secondary"}
              >
                {sorteio.status}
              </Badge>
            </div>
            <Progress value={progress} />
          </div>

          <ButtonGroup>
            {sorteio.status === "DRAFT" && (
              <Button
                disabled={startCollecting.isPending}
                onClick={() => startCollecting.mutate({ id: sorteio.id })}
              >
                {startCollecting.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <PlayIcon className="size-4" />
                )}
                Iniciar coleta
              </Button>
            )}

            {sorteio.status === "COLLECTING" && (
              <Button
                variant="outline"
                disabled={closeCollecting.isPending}
                onClick={() => closeCollecting.mutate({ id: sorteio.id })}
              >
                {closeCollecting.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <SquareIcon className="size-4" />
                )}
                Encerrar coleta
              </Button>
            )}

            {canDraw && (
              <Button
                disabled={draw.isPending}
                onClick={() => draw.mutate({ id: sorteio.id, count: 1 })}
              >
                {draw.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <TrophyIcon className="size-4" />
                )}
                Sortear próximo
              </Button>
            )}

            {canDraw && remaining > 1 && (
              <Button
                variant="secondary"
                disabled={draw.isPending}
                onClick={() =>
                  draw.mutate({ id: sorteio.id, count: remaining })
                }
              >
                Sortear restantes ({remaining})
              </Button>
            )}
          </ButtonGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganhadores</CardTitle>
          <CardDescription>
            Lista numerada na ordem em que foram sorteados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sorteio.winners.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum ganhador sorteado ainda.
            </p>
          ) : (
            <ol className="space-y-3">
              {sorteio.winners.map((w) => (
                <li
                  key={w.id}
                  className="flex items-start gap-3 rounded-md border p-3"
                >
                  <Badge className="mt-1 shrink-0">{w.position}º</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {w.comment.fromUsername
                        ? `@${w.comment.fromUsername}`
                        : w.comment.fromId}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {w.comment.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sorteado em{" "}
                      {format(new Date(w.drawnAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Substituir ganhador"
                      >
                        <RefreshCwIcon className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Substituir ganhador {w.position}º?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esse ganhador será removido e um novo será sorteado em
                          seu lugar, mantendo a posição {w.position}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            replaceWinner.mutate({
                              id: sorteio.id,
                              winnerId: w.id,
                            })
                          }
                        >
                          Substituir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
