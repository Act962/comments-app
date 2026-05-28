"use client";

import { Separator } from "@/components/ui/separator";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import {
  BadgeAlertIcon,
  Edit2Icon,
  EditIcon,
  ExternalLinkIcon,
  InstagramIcon,
  SendIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThenActionUpdate } from "./then-action-update";
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

      <div className="bg-background p-3 rounded-xl flex flex-col gap-y-2 group/prompt">
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

          <ThenActionUpdate
            automationId={automationId}
            initialData={automation.listeners}
          />
        </div>
        <p className="font-light text-muted-foreground">
          {automation.listeners.prompt}
        </p>
        {automation.listeners.listener === "MESSAGE" &&
          automation.listeners.buttons &&
          automation.listeners.buttons.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {automation.listeners.buttons.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-x-2 text-sm rounded-md border border-dashed px-3 py-2"
                >
                  <ExternalLinkIcon className="size-3" />
                  <span className="font-medium">{b.title}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {b.url}
                  </span>
                </div>
              ))}
            </div>
          )}
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
