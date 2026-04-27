"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSorteio } from "../hooks/use-sorteios";

const schema = z.object({
  title: z.string().min(1, "Informe um título").max(120),
  prizeName: z.string().max(120).optional().or(z.literal("")),
  prizeDescription: z.string().max(2000).optional().or(z.literal("")),
  prizeImage: z.string().url("URL inválida").optional().or(z.literal("")),
  winnersCount: z
    .string()
    .regex(/^\d+$/, "Informe um número inteiro")
    .refine((v) => {
      const n = Number.parseInt(v, 10);
      return n >= 1 && n <= 100;
    }, "Entre 1 e 100"),
});

type Schema = z.infer<typeof schema>;

type Props = {
  sorteio: {
    id: string;
    title: string;
    prizeName: string | null;
    prizeDescription: string | null;
    prizeImage: string | null;
    winnersCount: number;
  };
};

export const PrizeForm = ({ sorteio }: Props) => {
  const update = useUpdateSorteio();

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: sorteio.title,
      prizeName: sorteio.prizeName ?? "",
      prizeDescription: sorteio.prizeDescription ?? "",
      prizeImage: sorteio.prizeImage ?? "",
      winnersCount: String(sorteio.winnersCount),
    },
  });

  const prizeImage = form.watch("prizeImage");

  const onSubmit = (data: Schema) => {
    update.mutate({
      id: sorteio.id,
      title: data.title,
      prizeName: data.prizeName || null,
      prizeDescription: data.prizeDescription || null,
      prizeImage: data.prizeImage || null,
      winnersCount: Number.parseInt(data.winnersCount, 10),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prêmio</CardTitle>
        <CardDescription>
          Configure o título do sorteio, o prêmio e quantos ganhadores serão
          escolhidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Título do sorteio</FieldLabel>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <FieldError>{form.formState.errors.title.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="prizeName">Nome do prêmio</FieldLabel>
              <Input
                id="prizeName"
                placeholder="Ex.: Kit assinatura premium"
                {...form.register("prizeName")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="prizeDescription">Descrição</FieldLabel>
              <Textarea
                id="prizeDescription"
                rows={4}
                placeholder="Descreva o prêmio para os participantes"
                {...form.register("prizeDescription")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="prizeImage">
                Imagem do prêmio (URL)
              </FieldLabel>
              <Input
                id="prizeImage"
                type="url"
                placeholder="https://..."
                {...form.register("prizeImage")}
              />
              {form.formState.errors.prizeImage && (
                <FieldError>
                  {form.formState.errors.prizeImage.message}
                </FieldError>
              )}
              {prizeImage && (
                <div className="mt-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-md border">
                  <Image
                    src={prizeImage}
                    alt="Prévia do prêmio"
                    fill
                    sizes="384px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="winnersCount">
                Quantidade de ganhadores
              </FieldLabel>
              <Input
                id="winnersCount"
                type="number"
                min={1}
                max={100}
                {...form.register("winnersCount")}
              />
              <FieldDescription>
                O sorteio é encerrado quando esse total for atingido. Quem já
                ganhou nunca é sorteado novamente.
              </FieldDescription>
              {form.formState.errors.winnersCount && (
                <FieldError>
                  {form.formState.errors.winnersCount.message}
                </FieldError>
              )}
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending && <Spinner className="size-4" />}
                Salvar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
