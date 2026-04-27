"use client";

import { GiftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { useCreateSorteio, useSuspenseSorteios } from "../hooks/use-sorteios";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  COLLECTING: "Coletando",
  CLOSED: "Coleta encerrada",
  DRAWN: "Sorteado",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  COLLECTING: "default",
  CLOSED: "secondary",
  DRAWN: "default",
};

export const SorteioList = () => {
  const { data: sorteios } = useSuspenseSorteios();

  return (
    <div className="space-y-2">
      {sorteios.length === 0 && (
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Sem sorteios</ItemTitle>
            <ItemDescription>
              Crie seu primeiro sorteio entre os comentários de um post
            </ItemDescription>
          </ItemContent>
        </Item>
      )}
      {sorteios.map((sorteio) => (
        <Item key={sorteio.id} variant="outline">
          <ItemContent>
            <div className="flex items-center gap-2">
              <GiftIcon className="size-4 text-muted-foreground" />
              <ItemTitle>{sorteio.title}</ItemTitle>
              <Badge variant={STATUS_VARIANT[sorteio.status] ?? "outline"}>
                {STATUS_LABEL[sorteio.status] ?? sorteio.status}
              </Badge>
            </div>
            <ItemDescription>
              {sorteio.prizeName
                ? `Prêmio: ${sorteio.prizeName}`
                : "Sem prêmio definido"}
            </ItemDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">
                {sorteio._count.posts} post
                {sorteio._count.posts === 1 ? "" : "s"}
              </Badge>
              <Badge variant="secondary">
                {sorteio._count.comments} comentário
                {sorteio._count.comments === 1 ? "" : "s"}
              </Badge>
              <Badge variant="secondary">
                {sorteio._count.winners}/{sorteio.winnersCount} ganhador
                {sorteio.winnersCount === 1 ? "" : "es"}
              </Badge>
            </div>
          </ItemContent>
          <ItemActions>
            <Button variant="secondary" asChild>
              <Link href={`/sorteios/${sorteio.id}`}>Abrir</Link>
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
};

export const SorteioHeader = () => {
  const router = useRouter();
  const create = useCreateSorteio();

  const onCreate = () => {
    create.mutate(
      { title: "Sem título" },
      {
        onSuccess: (data) => router.push(`/sorteios/${data.id}`),
      },
    );
  };

  return (
    <EntityHeader
      title="Sorteios"
      description="Sorteie um ganhador entre os comentários de seus posts"
      onNew={onCreate}
      newButtonLabel="Novo sorteio"
      isCreating={create.isPending}
    />
  );
};

export const SorteioContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<SorteioHeader />}>{children}</EntityContainer>
  );
};
