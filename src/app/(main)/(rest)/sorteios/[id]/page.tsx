import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EntityContainer } from "@/components/entity-components";
import { SorteioEditor } from "@/features/sorteio/components/sorteio-editor";
import { prefetchSorteio } from "@/features/sorteio/server/prefetch";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SorteioDetailPage({ params }: Props) {
  const { id } = await params;
  prefetchSorteio({ id });

  return (
    <EntityContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Erro ao carregar sorteio</div>}>
          <Suspense fallback={<div>Carregando sorteio...</div>}>
            <SorteioEditor id={id} />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </EntityContainer>
  );
}
