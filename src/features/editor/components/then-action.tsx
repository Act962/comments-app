"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateListener } from "@/features/listener/hooks/use-listener";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["MESSAGE", "SMARTAI"]),
  prompt: z.string().min(1, "Digite um prompt"),
  reply: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const ThenAction = ({ automationId }: { automationId: string }) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "MESSAGE",
      prompt: "",
      reply: "",
    },
  });

  const createListener = useCreateListener();

  const watchType = form.watch("type");

  const onSubmit = (data: Schema) => {
    createListener.mutate({
      automationId: automationId,
      listener: data.type,
      prompt: data.prompt,
      reply: data.reply,
    });
  };

  const isPending = createListener.isPending;

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
              disabled={isPending}
            />
          </Field>

          <Input
            {...form.register("reply")}
            placeholder="Adicione uma resposta ao comentário (opcional)"
            disabled={isPending}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Spinner />}
            Adicionar
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
