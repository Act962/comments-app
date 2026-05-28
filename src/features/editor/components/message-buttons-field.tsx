"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";

type ButtonForm = { title: string; url: string };

interface Props<TFieldValues extends { buttons?: ButtonForm[] }> {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  disabled?: boolean;
}

export function MessageButtonsField<
  TFieldValues extends { buttons?: ButtonForm[] },
>({ control, register, errors, disabled }: Props<TFieldValues>) {
  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form generic name typing
  const { fields, append, remove } = useFieldArray<any>({
    control,
    name: "buttons",
  });

  const buttonErrors = errors.buttons as
    | { title?: { message?: string }; url?: { message?: string } }[]
    | undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">
        Botões (opcional) — máx. 3
      </Label>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-1 rounded-md border p-2"
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="Título do botão"
              maxLength={20}
              disabled={disabled}
              {...register(`buttons.${index}.title` as never)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => remove(index)}
              disabled={disabled}
              aria-label="Remover botão"
            >
              <Trash2Icon className="size-3" />
            </Button>
          </div>
          <Input
            placeholder="https://..."
            type="url"
            disabled={disabled}
            {...register(`buttons.${index}.url` as never)}
          />
          {buttonErrors?.[index]?.title?.message && (
            <span className="text-xs text-destructive">
              {buttonErrors[index].title?.message}
            </span>
          )}
          {buttonErrors?.[index]?.url?.message && (
            <span className="text-xs text-destructive">
              {buttonErrors[index].url?.message}
            </span>
          )}
        </div>
      ))}

      {fields.length < 3 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-dashed"
          disabled={disabled}
          onClick={() => append({ title: "", url: "" })}
        >
          <PlusIcon className="size-3" />
          Adicionar botão
        </Button>
      )}
    </div>
  );
}
