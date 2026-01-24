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
import { CheckIcon, PlusIcon } from "lucide-react";

export const WorkflowList = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
      <div className="lg:col-span-4">Automações</div>
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
  return (
    <>
      <EntityHeader
        title="Automações"
        description="Gerencie suas automações"
        disabled={disabled}
        onNew={() => {}}
        newButtonLabel="Nova automação"
        isCreating={false}
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
