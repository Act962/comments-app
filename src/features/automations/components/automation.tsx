"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRightIcon, CheckIcon, PlusIcon } from "lucide-react";
import {
  userCreateAutomation,
  useSuspenseAutomations,
} from "../hooks/use-automations";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const WorkflowList = () => {
  const { data: automations } = useSuspenseAutomations();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
      <div className="lg:col-span-4 space-y-2">
        {automations.length === 0 && (
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Sem automações</ItemTitle>
              <ItemDescription>
                Você ainda não tem nenhuma automação
              </ItemDescription>
            </ItemContent>
          </Item>
        )}
        {automations.map((automation) => (
          <Item key={automation.id} variant="outline">
            <ItemContent>
              <ItemTitle>{automation.name}</ItemTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {automation.keywords.length === 0 && (
                  <Badge>Sem palavras-chave</Badge>
                )}
                {automation.keywords.map((keyword) => (
                  <Badge key={keyword.id}>{keyword.word}</Badge>
                ))}
              </div>
            </ItemContent>
            <ItemActions>
              <Button variant="secondary" asChild>
                <Link href={`/workflows/${automation.id}`}>Ver</Link>
              </Button>
            </ItemActions>
          </Item>
        ))}
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle>Automação</CardTitle>
            <CardDescription>
              Suas automações irão aparecer aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-start justify-between">
                <div className="flex flex-col">
                  <h3 className="font-medium">
                    Direct traffic to your website
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    17 de janeiro de 2026
                  </p>
                </div>
                <CheckIcon className="size-4" />
              </div>
            ))}

            <Button className="w-full mt-4">
              {" "}
              <PlusIcon className="size-4" /> Adicionar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const WorkflowHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createMutation = userCreateAutomation();

  const onCreate = () => {
    createMutation.mutate(
      {
        name: "Sem título",
      },
      {
        onSuccess: (data) => {
          console.log(data);
          router.push(`/workflows/${data.id}`);
        },
      },
    );
  };

  return (
    <>
      <EntityHeader
        title="Automações"
        description="Gerencie suas automações"
        disabled={disabled}
        onNew={onCreate}
        newButtonLabel="Nova automação"
        isCreating={createMutation.isPending}
      />
    </>
  );
};

export const WorkflowContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<WorkflowHeader />}>{children}</EntityContainer>
  );
};
