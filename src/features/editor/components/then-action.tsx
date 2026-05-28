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
import { useCreateListener } from "@/features/listener/hooks/use-listener";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
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

export const ThenAction = ({ automationId }: { automationId: string }) => {
  const [view, setView] = useState<View>("closed");
  const form = useForm<ThenActionFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "MESSAGE",
      prompt: "",
      reply: "",
      buttons: [],
    },
  });

  const createListener = useCreateListener();

  const onSubmit = (data: ThenActionFormSchema) => {
    createListener.mutate(
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
          form.reset();
        },
      },
    );
  };

  const isPending = createListener.isPending;

  return (
    <>
      <Popover
        open={view === "popover"}
        onOpenChange={(o) => setView(o ? "popover" : "closed")}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full border-dashed">
            <PlusIcon className="size-4" />
            Então
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-[400px]">
          <ThenActionForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            submitLabel="Adicionar"
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
            <SheetTitle>Configurar resposta</SheetTitle>
            <SheetDescription>
              Defina a mensagem e botões enviados ao usuário.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ThenActionForm
              form={form}
              onSubmit={onSubmit}
              isPending={isPending}
              submitLabel="Adicionar"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
