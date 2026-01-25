"use client";

import { FieldSeparator } from "@/components/ui/field";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import { ActiveTrigger } from "./active-trigger";
import { ThenAction } from "./then-action";
import { TriggerButton } from "./trigger-button";

export const Trigger = ({ workflowId }: { workflowId: string }) => {
  const { data: automation } = useSuspenseAutomation(workflowId);

  if (automation && automation.triggers.length > 0) {
    return (
      <div className="flex flex-col gap-y-6 items-center">
        <ActiveTrigger
          type={automation.triggers[0].type}
          keywords={automation.keywords}
        />

        {automation.triggers.length > 1 && (
          <>
            <FieldSeparator className="w-full">ou</FieldSeparator>

            <ActiveTrigger
              type={automation.triggers[1].type}
              keywords={automation.keywords}
            />
          </>
        )}

        {!automation.listeners && <ThenAction automationId={workflowId} />}
      </div>
    );
  }

  return <TriggerButton automationId={workflowId} />;
};
