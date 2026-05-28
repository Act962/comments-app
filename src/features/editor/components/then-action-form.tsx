"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Maximize2Icon } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { MessageButtonsField } from "./message-buttons-field";

export type ThenActionFormSchema = {
  type: "MESSAGE" | "SMARTAI";
  prompt: string;
  reply?: string;
  buttons?: { title: string; url: string }[];
};

interface Props {
  form: UseFormReturn<ThenActionFormSchema>;
  onSubmit: (data: ThenActionFormSchema) => void;
  isPending: boolean;
  submitLabel: string;
  onExpand?: () => void;
}

export function ThenActionForm({
  form,
  onSubmit,
  isPending,
  submitLabel,
  onExpand,
}: Props) {
  const watchType = form.watch("type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      {onExpand && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onExpand}
            aria-label="Expandir"
          >
            <Maximize2Icon className="size-3" />
          </Button>
        </div>
      )}

      <Controller
        name="type"
        control={form.control}
        render={({ field }) => (
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
        )}
      />

      <Field className="relative text-end">
        <Controller
          control={form.control}
          name="prompt"
          render={({ field, fieldState }) => (
            <>
              <Textarea
                placeholder={
                  watchType === "SMARTAI"
                    ? "Adicione o prompt que a IA irá usar..."
                    : "Adicione a mensagem que será enviada para seu cliente"
                }
                {...field}
                disabled={isPending}
                className="max-h-32 pr-12"
              />

              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </>
          )}
        />

        <span className="text-muted-foreground">
          {form.watch("prompt")?.length || 0}/1000
        </span>
      </Field>

      <Input
        {...form.register("reply")}
        placeholder="Adicione uma resposta ao comentário (opcional)"
        disabled={isPending}
      />

      {watchType === "MESSAGE" && (
        <MessageButtonsField
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          disabled={isPending}
        />
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner />}
        {submitLabel}
      </Button>
    </form>
  );
}
