import { prefetchAutomation } from "@/features/automations/server/prefetch";
import Editor from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ workflowId: string }>;
}

export default async function Workflow({ params }: Props) {
  const { workflowId } = await params;
  prefetchAutomation({ id: workflowId });
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
