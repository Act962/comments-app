"use client";

import { Separator } from "@/components/ui/separator";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import { BadgeAlertIcon, InstagramIcon, SendIcon } from "lucide-react";
import { PostButton } from "./post-button";

export function ThenNode({ automationId }: { automationId: string }) {
  const { data: automation } = useSuspenseAutomation(automationId);
  const commentTrigger = automation?.triggers.find((t) => t.type === "COMMENT");

  return !automation?.listeners ? (
    <></>
  ) : (
    <div className="w-full lg:w-10/12 relative xl:w-6/12 p-5 rounded-xl flex flex-col bg-card gap-y-3 border">
      <div className="absolute h-20 left-1/2 bottom-full flex flex-col items-center z-50">
        <span className="size-[3px] bg-accent rounded-full" />
        <Separator
          orientation="vertical"
          className="bottom-full flex-1 border border-accent"
        />
        <span className="size-[3px] bg-accent rounded-full" />
      </div>

      <div className="flex gap-x-2 items-center">
        <BadgeAlertIcon className="size-4" />
        Então...
      </div>

      <div className="bg-background p-3 rounded-xl flex flex-col gap-y-2">
        <div className="flex gap-x-2 items-center">
          {automation.listeners.listener === "MESSAGE" ? (
            <InstagramIcon />
          ) : (
            <SendIcon />
          )}
          <p className="text-lg">
            {automation.listeners.listener === "MESSAGE"
              ? "Enviar mensagem ao usuário"
              : "Resposta IA"}
          </p>
        </div>
        <p className="font-light text-muted-foreground">
          {automation.listeners.prompt}
        </p>
      </div>
      {automation.posts.length > 0 ? (
        <></>
      ) : commentTrigger ? (
        <PostButton automationId={automationId} />
      ) : (
        <></>
      )}
    </div>
  );
}
