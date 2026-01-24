import {
  WorkflowContainer,
  WorkflowList,
} from "@/features/automations/components/automation";
import { prefetchAutomations } from "@/features/automations/server/prefetch";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

export default function Workflows() {
  prefetchAutomations();

  return (
    <WorkflowContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Erro ao carregar automações</div>}>
          <Suspense fallback={<div>Carregando automações...</div>}>
            <WorkflowList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowContainer>
  );
}
