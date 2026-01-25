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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InstagramIcon, PlusIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { Keywords } from "./keywords";
import { useCreateTrigger } from "@/features/trigger/hooks/use-trigger";
import { Spinner } from "@/components/ui/spinner";

export function TriggerButton({ automationId }: { automationId: string }) {
  const [trigger, setTrigger] = useState<"COMMENT" | "DM">("COMMENT");
  const createTrigger = useCreateTrigger();

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

  const onCreate = () => {
    createTrigger.mutate({
      automationId,
      type: trigger,
    });
  };

  const isLoading = createTrigger.isPending;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full border-dashed">
          <PlusIcon className="size-4" />
          Adicionar Gatilho
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
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
        <Keywords automationId={automationId} />
        <Button className="w-full" onClick={onCreate} disabled={isLoading}>
          {isLoading && <Spinner />}
          Criar Gatilho
        </Button>
      </PopoverContent>
    </Popover>
  );
}
