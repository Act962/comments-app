import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  SorteioContainer,
  SorteioList,
} from "@/features/sorteio/components/sorteio-list";
import { prefetchSorteios } from "@/features/sorteio/server/prefetch";
import { HydrateClient } from "@/trpc/server";

export default function SorteiosPage() {
  prefetchSorteios();

  return (
    <SorteioContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Erro ao carregar sorteios</div>}>
          <Suspense fallback={<div>Carregando sorteios...</div>}>
            <SorteioList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </SorteioContainer>
  );
}
