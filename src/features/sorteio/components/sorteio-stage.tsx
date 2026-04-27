"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  GiftIcon,
  PartyPopperIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useDrawSorteio } from "../hooks/use-sorteios";

type Winner = {
  id: string;
  position: number;
  drawnAt: string;
  comment: {
    text: string;
    fromUsername: string | null;
    commentedAt: string;
  };
};

export type PublicSorteio = {
  id: string;
  userId: string;
  title: string;
  prizeName: string | null;
  prizeDescription: string | null;
  prizeImage: string | null;
  winnersCount: number;
  status: "DRAFT" | "COLLECTING" | "CLOSED" | "DRAWN";
  slug: string;
  lastDrawnAt: string | null;
  participantsCount: number;
  _count: { comments: number; posts: number };
  winners: Winner[];
};

const STATUS_LABEL: Record<PublicSorteio["status"], string> = {
  DRAFT: "Em preparação",
  COLLECTING: "Coletando comentários",
  CLOSED: "Coleta encerrada",
  DRAWN: "Finalizado",
};

export const SorteioStage = ({ initial }: { initial: PublicSorteio }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const isOwner = session.data?.user.id === initial.userId;

  const queryOpts = trpc.sorteioPublic.getPublicBySlug.queryOptions({
    slug: initial.slug,
  });
  const { data } = useQuery({
    ...queryOpts,
    initialData: initial,
    refetchInterval: initial.status === "DRAWN" ? false : 8000,
  });

  const sorteio = (data ?? initial) as PublicSorteio;

  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedPositions, setRevealedPositions] = useState<Set<number>>(
    () => new Set(sorteio.winners.map((w) => w.position)),
  );

  useEffect(() => {
    setRevealedPositions((prev) => {
      const next = new Set(prev);
      for (const w of sorteio.winners) next.add(w.position);
      return next;
    });
  }, [sorteio.winners]);

  const drawMutation = useDrawSorteio(sorteio.id);

  const drawn = sorteio.winners.length;
  const remaining = sorteio.winnersCount - drawn;
  const progress = (drawn / sorteio.winnersCount) * 100;
  const canDraw =
    isOwner &&
    (sorteio.status === "COLLECTING" || sorteio.status === "CLOSED") &&
    remaining > 0;

  const onDraw = async () => {
    if (!canDraw || isSpinning) return;
    setIsSpinning(true);

    const previousPositions = new Set(sorteio.winners.map((w) => w.position));

    const minSpinMs = 2800;
    const start = Date.now();

    try {
      await drawMutation.mutateAsync({ id: sorteio.id, count: 1 });
    } catch {
      return;
    }

    const elapsed = Date.now() - start;
    if (elapsed < minSpinMs) {
      await new Promise((r) => setTimeout(r, minSpinMs - elapsed));
    }

    await queryClient.invalidateQueries(queryOpts);
    setIsSpinning(false);

    setRevealedPositions(previousPositions);
    setTimeout(() => {
      setRevealedPositions((prev) => {
        const next = new Set(prev);
        for (let p = 1; p <= sorteio.winnersCount; p++) {
          if (!previousPositions.has(p)) next.add(p);
        }
        return next;
      });
    }, 80);
  };

  const stats = [
    {
      label: "Posts",
      value: sorteio._count.posts,
      icon: GiftIcon,
    },
    {
      label: "Comentários",
      value: sorteio._count.comments,
      icon: SparklesIcon,
    },
    {
      label: "Participantes",
      value: sorteio.participantsCount,
      icon: UsersIcon,
    },
  ];

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8 md:py-12">
      <SpinOverlay
        open={isSpinning}
        prizeName={sorteio.prizeName}
        prizeImage={sorteio.prizeImage}
      />

      <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6 text-center">
        <Badge
          variant={sorteio.status === "DRAWN" ? "default" : "secondary"}
          className="mb-3"
        >
          {STATUS_LABEL[sorteio.status]}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          {sorteio.title}
        </h1>
      </div>

      <Card className="overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        {sorteio.prizeImage && (
          <div className="relative aspect-[16/9] w-full bg-muted">
            <Image
              src={sorteio.prizeImage}
              alt={sorteio.prizeName ?? sorteio.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            {sorteio.prizeName && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-widest text-white/80">
                  Prêmio
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                  {sorteio.prizeName}
                </p>
              </div>
            )}
          </div>
        )}
        {!sorteio.prizeImage && sorteio.prizeName && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GiftIcon className="size-6 text-primary" />
              {sorteio.prizeName}
            </CardTitle>
            {sorteio.prizeDescription && (
              <CardDescription className="text-base whitespace-pre-wrap">
                {sorteio.prizeDescription}
              </CardDescription>
            )}
          </CardHeader>
        )}
        {sorteio.prizeImage && sorteio.prizeDescription && (
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-sm md:text-base text-muted-foreground">
              {sorteio.prizeDescription}
            </p>
          </CardContent>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <CardContent className="flex flex-col items-center gap-1 py-4">
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-2xl md:text-3xl font-bold tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardContent className="space-y-3 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {drawn}/{sorteio.winnersCount} ganhador
              {sorteio.winnersCount === 1 ? "" : "es"} sorteado
              {drawn === 1 ? "" : "s"}
            </span>
            {remaining > 0 && (
              <span className="text-muted-foreground">Restam {remaining}</span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {canDraw && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onDraw}
            disabled={isSpinning || drawMutation.isPending}
            className="group relative overflow-hidden rounded-full bg-primary px-10 py-5 md:px-14 md:py-6 text-lg md:text-2xl font-bold text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <span className="relative flex items-center gap-3">
              <SparklesIcon className="size-6 animate-pulse" />
              {drawn === 0 ? "SORTEAR AGORA" : "SORTEAR PRÓXIMO"}
              {remaining > 1 && (
                <span className="ml-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-sm">
                  {remaining}
                </span>
              )}
            </span>
          </button>
        </div>
      )}

      {!isOwner && sorteio.status !== "DRAWN" && drawn === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground animate-pulse">
          Aguardando o sorteio começar...
        </p>
      )}

      {drawn > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="flex items-center justify-center gap-2 text-xl md:text-2xl font-semibold">
            <TrophyIcon className="size-6 text-amber-500" />
            {sorteio.status === "DRAWN" ? "Ganhadores" : "Já sorteados"}
          </h2>
          <ol className="space-y-3">
            {sorteio.winners.map((w) => (
              <WinnerCard
                key={w.id}
                winner={w}
                revealed={revealedPositions.has(w.position)}
                isFinal={
                  sorteio.status === "DRAWN" &&
                  w.position === sorteio.winnersCount
                }
              />
            ))}
          </ol>
        </div>
      )}

      {sorteio.status === "DRAWN" && (
        <div className="mt-10 text-center animate-in fade-in zoom-in-95 duration-700">
          <PartyPopperIcon className="mx-auto size-12 text-amber-500 animate-bounce" />
          <p className="mt-2 text-lg font-semibold">Sorteio finalizado!</p>
          <p className="text-sm text-muted-foreground">
            Parabéns aos ganhadores 🎉
          </p>
        </div>
      )}
    </div>
  );
};

const WinnerCard = ({
  winner,
  revealed,
  isFinal,
}: {
  winner: Winner;
  revealed: boolean;
  isFinal: boolean;
}) => {
  if (!revealed) {
    return (
      <li className="flex items-center justify-center rounded-lg border border-dashed bg-card/50 p-6 text-muted-foreground">
        <SparklesIcon className="size-5 animate-spin" />
      </li>
    );
  }

  const username = winner.comment.fromUsername
    ? `@${winner.comment.fromUsername}`
    : "Participante";

  return (
    <li
      className={`relative flex items-start gap-4 rounded-lg border bg-card p-4 md:p-5 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ${
        isFinal ? "ring-2 ring-amber-500 shadow-lg" : ""
      }`}
    >
      <Badge
        className={`mt-1 shrink-0 text-base ${
          winner.position === 1
            ? "bg-amber-500 hover:bg-amber-500"
            : winner.position === 2
              ? "bg-zinc-400 hover:bg-zinc-400"
              : winner.position === 3
                ? "bg-amber-700 hover:bg-amber-700"
                : ""
        }`}
      >
        {winner.position}º
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-lg md:text-xl font-bold">{username}</p>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
          “{winner.comment.text}”
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Sorteado em{" "}
          {format(new Date(winner.drawnAt), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </p>
      </div>
      {isFinal && (
        <TrophyIcon className="size-6 text-amber-500 animate-pulse" />
      )}
    </li>
  );
};

const SPIN_NAMES = [
  "@maria",
  "@joao_silva",
  "@anaclara",
  "@pedro.santos",
  "@lucas",
  "@beatriz",
  "@rafael_",
  "@gabriela",
  "@thiago",
  "@camila.r",
  "@bruno",
  "@isabela",
  "@matheus",
  "@laura",
  "@vitor",
];

const SpinOverlay = ({
  open,
  prizeName,
  prizeImage,
}: {
  open: boolean;
  prizeName: string | null;
  prizeImage: string | null;
}) => {
  const [name, setName] = useState(SPIN_NAMES[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setName(SPIN_NAMES[Math.floor(Math.random() * SPIN_NAMES.length)]);
    }, 80);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center space-y-6">
        {prizeImage && (
          <div className="relative mx-auto size-24 md:size-32 overflow-hidden rounded-full ring-4 ring-primary animate-pulse">
            <Image
              src={prizeImage}
              alt={prizeName ?? "Prêmio"}
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          </div>
        )}
        <div>
          <p className="text-sm md:text-base uppercase tracking-widest text-muted-foreground">
            Sorteando...
          </p>
          <p
            key={name}
            className="mt-2 text-3xl md:text-5xl font-bold tabular-nums animate-in fade-in zoom-in-95 duration-100"
          >
            {name}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-3 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
};
