import { BuildingIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type NoEmpresaPlaceholderProps = {
  hasOrganizations: boolean;
};

export function NoEmpresaPlaceholder({
  hasOrganizations,
}: NoEmpresaPlaceholderProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty className="bg-muted/30 max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BuildingIcon />
          </EmptyMedia>
          <EmptyTitle>
            {hasOrganizations
              ? "Selecione uma empresa"
              : "Crie sua primeira empresa"}
          </EmptyTitle>
          <EmptyDescription>
            {hasOrganizations
              ? "Use o seletor no topo do menu lateral para escolher uma empresa e começar a trabalhar."
              : "Você precisa de uma empresa para usar automações, integrações e cobrança."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/empresas/nova" prefetch>
              Criar empresa
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
