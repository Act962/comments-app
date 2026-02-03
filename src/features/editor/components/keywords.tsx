"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import {
  useCreateKeyword,
  useDeleteKeyword,
} from "@/features/keyword/hooks/use-keyword";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  automationId: string;
};

interface Keyword {
  id: string;
  word: string;
  automationId: string | null;
}

export function Keywords({ automationId }: Props) {
  const [keyword, setKeyword] = useState("");
  const { data: automation } = useSuspenseAutomation(automationId);
  const createKeyword = useCreateKeyword();
  const deleteKeyword = useDeleteKeyword();

  const handleCreateKeyword = () => {
    createKeyword.mutate(
      {
        automationId,
        keyword,
      },
      {
        onSuccess: (data) => {
          setKeyword("");
        },
        onSettled(data, error, variables, onMutateResult, context) {
          console.log(data, error, variables, onMutateResult, context);
        },
      },
    );
  };

  const handleDeleteKeyword = (id: string) => {
    deleteKeyword.mutate({
      id,
      automationId,
    });
  };

  return (
    <div className="bg-background flex flex-col gap-y-3 p-3 rounded-xl mt-2">
      <p className="text-sm text-muted-foreground">
        Adicione palavras-chave como gatilhos da automação
      </p>
      <div className="flex flex-wrap justify-start gap-2 items-center">
        {automation?.keywords &&
          automation.keywords.length > 0 &&
          automation.keywords.map((keyword) => {
            return (
              <div key={keyword.id}>
                <div className="flex items-center gap-x-2 bg-muted px-2 py-1 rounded-md">
                  {keyword.word}
                  <XIcon
                    className="size-3 cursor-pointer"
                    onClick={() => handleDeleteKeyword(keyword.id)}
                  />
                </div>
              </div>
            );
          })}
      </div>
      <Input
        placeholder="Digite a palavra-chave"
        value={keyword}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCreateKeyword();
          }
        }}
        onChange={(e) => setKeyword(e.target.value)}
      />
    </div>
  );
}
