"use client";

import { Badge } from "@/components/ui/badge";
import { InstagramIcon, SendIcon } from "lucide-react";

interface ActiveTriggerProps {
  type: string;
  keywords: {
    id: string;
    word: string;
    automationId: string | null;
  }[];
}

export const ActiveTrigger = ({ type, keywords }: ActiveTriggerProps) => {
  return (
    <div className="bg-background p-3 rounded-xl w-full">
      <div className="flex gap-x-2 items-center">
        {type === "COMMENT" ? <InstagramIcon /> : <SendIcon />}
        <p>
          {type === "COMMENT"
            ? "Quando alguém comenta em um de meus posts"
            : "Quando alguém me envia mensagem no direct"}
        </p>
      </div>
      <p className="text-muted-foreground">
        {type === "COMMENT"
          ? "Se o comentário contiver as palavras-chave abaixo, a automação será ativada"
          : "Se a mensagem contiver as palavras-chave abaixo, a automação será ativada"}
      </p>
      <div className="flex gap-2 mt-5 flex-wrap">
        {keywords.map((keyword) => (
          <Badge key={keyword.id}>{keyword.word}</Badge>
        ))}
      </div>
    </div>
  );
};
