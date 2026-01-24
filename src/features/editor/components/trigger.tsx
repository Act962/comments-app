"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSuspenseAutomation } from "@/features/automations/hooks/use-automations";
import { Instagram, InstagramIcon, PlusIcon, SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

        {!automation.listeners && <ThenAction />}
      </div>
    );
  }

  return <TriggerButton />;
};

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

const schema = z.object({
  type: z.enum(["MESSAGE", "SMARTAI"]),
  prompt: z.string().min(1, "Digite um prompt"),
  reply: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const ThenAction = () => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "MESSAGE",
      prompt: "",
      reply: "",
    },
  });

  const watchType = form.watch("type");

  const onSubmit = (data: Schema) => {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <PlusIcon className="size-4" />
          Então
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => {
              return (
                <FieldSet>
                  <RadioGroup
                    className="w-full"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FieldLabel htmlFor="message" role="button">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Enviar mensagem ao usuário</FieldTitle>
                          <FieldDescription>
                            Digite a mensagem que será enviada ao usuário
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value="MESSAGE"
                          id="message"
                          className="sr-only"
                        />
                      </Field>
                    </FieldLabel>

                    <FieldLabel htmlFor="smartai" role="button">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Resposta IA</FieldTitle>
                          <FieldDescription>
                            Resposta IA baseada no comentário
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value="SMARTAI"
                          id="smartai"
                          className="sr-only"
                        />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              );
            }}
          />

          <Field className="">
            <Textarea
              placeholder={
                watchType === "SMARTAI"
                  ? "Adicione o prompt que a IA irá usar..."
                  : "Adicione a mensagem que será enviada para seu cliente"
              }
              {...form.register("prompt")}
            />
          </Field>

          <Input
            {...form.register("reply")}
            placeholder="Adicione uma resposta ao comentário (opcional)"
          />

          <Button type="submit" className="w-full">
            Adicionar
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

function TriggerButton() {
  const [trigger, setTrigger] = useState<"COMMENT" | "DM">("COMMENT");

  const triggersOptions = [
    {
      value: "COMMENT",
      label: "Quando alguém comenta em um de meus posts",
      description: "Selecione se você quer automatizar comentários no seu post",
      type: "COMMENT",
      icon: InstagramIcon,
    },
    {
      value: "DM",
      label: "Quando alguém envia palavra-chave no direct",
      description: "Selecione se você quer automatizar mensagens no direct",
      type: "DM",
      icon: SendIcon,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <PlusIcon className="size-4" />
          Adicionar Gatilho
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <form>
          <FieldSet>
            <RadioGroup
              className="w-full"
              name="trigger"
              value={trigger}
              onValueChange={(value) => setTrigger(value as "COMMENT" | "DM")}
            >
              {triggersOptions.map((trigger) => (
                <FieldLabel
                  key={trigger.value}
                  htmlFor={trigger.value}
                  role="button"
                >
                  <Field orientation="horizontal">
                    <trigger.icon className="size-4" />
                    <FieldContent>
                      <FieldTitle>{trigger.label}</FieldTitle>
                      <FieldDescription>{trigger.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={trigger.value}
                      id={trigger.value}
                      className="sr-only"
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </FieldSet>
        </form>
      </PopoverContent>
    </Popover>
  );
}
