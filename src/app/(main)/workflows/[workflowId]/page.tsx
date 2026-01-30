import { Spinner } from "@/components/ui/spinner";
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
        <Suspense
          fallback={
            <div className="h-full items-center justify-center flex">
              <Spinner />
            </div>
          }
        >
          <div className="h-screen flex flex-col">
            <EditorHeader workflowId={workflowId} />
            <main className="flex-1 overflow-y-auto">
              <Editor workflowId={workflowId} />
            </main>
          </div>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
