"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateListener } from "@/features/listener/hooks/use-listener";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  ThenActionForm,
  type ThenActionFormSchema,
} from "./then-action-form";

const schema = z.object({
  type: z.enum(["MESSAGE", "SMARTAI"]),
  prompt: z
    .string()
    .min(1, "Digite um prompt")
    .max(1000, "Mensagem muito longa"),
  reply: z.string().optional(),
  buttons: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Título obrigatório")
          .max(20, "Título muito longo"),
        url: z.string().url("URL inválida"),
      }),
    )
    .max(3, "Máximo 3 botões")
    .optional(),
});

type View = "closed" | "popover" | "sheet";

interface Props {
  automationId: string;
  initialData: {
    listener: "SMARTAI" | "MESSAGE";
    prompt: string;
    commentReply?: string | null;
    buttons?: { title: string; url: string }[];
  };
}

export const ThenActionUpdate = ({ automationId, initialData }: Props) => {
  const [view, setView] = useState<View>("closed");
  const form = useForm<ThenActionFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialData.listener,
      prompt: initialData.prompt,
      reply: initialData.commentReply || "",
      buttons: initialData.buttons ?? [],
    },
  });

  const updateListener = useUpdateListener();

  const onSubmit = (data: ThenActionFormSchema) => {
    updateListener.mutate(
      {
        automationId: automationId,
        listener: data.type,
        prompt: data.prompt,
        reply: data.reply,
        buttons: data.type === "MESSAGE" ? data.buttons ?? [] : [],
      },
      {
        onSuccess: () => {
          setView("closed");
        },
      },
    );
  };

  const isPending = updateListener.isPending;

  return (
    <>
      <Popover
        open={view === "popover"}
        onOpenChange={(o) => setView(o ? "popover" : "closed")}
      >
        <PopoverTrigger asChild>
          <Button
            className="ml-auto opacity-0 group-hover/prompt:opacity-100"
            size="icon-xs"
            variant="outline"
          >
            <EditIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-[400px]">
          <ThenActionForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            submitLabel="Atualizar"
            onExpand={() => setView("sheet")}
          />
        </PopoverContent>
      </Popover>

      <Sheet
        open={view === "sheet"}
        onOpenChange={(o) => setView(o ? "sheet" : "closed")}
      >
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Editar resposta</SheetTitle>
            <SheetDescription>
              Defina a mensagem e botões enviados ao usuário.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ThenActionForm
              form={form}
              onSubmit={onSubmit}
              isPending={isPending}
              submitLabel="Atualizar"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
