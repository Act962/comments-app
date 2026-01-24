"use client";

import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import { Trigger } from "./trigger";
import { BadgeAlertIcon } from "lucide-react";

export default function Editor({ workflowId }: { workflowId: string }) {
  const { data: automation } = useSuspenseAutomation(workflowId);
  return (
    <div className="flex items-start py-10 justify-center h-full px-4">
      <div className="flex flex-col items-center gap-y-20 w-full">
        {/* Wheen */}
        <div className="w-full bg-card border border-border lg:w-10/12 xl:w-6/12 p-5 rounded-xl flex flex-col  gap-y-3">
          <div className="flex items-center gap-x-2">
            <BadgeAlertIcon className="size-4" />
            Quando
          </div>
          <Trigger workflowId={workflowId} />
        </div>
      </div>
    </div>
  );
}
