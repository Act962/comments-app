"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120, "Nome muito longo"),
});
type Schema = z.infer<typeof schema>;

function buildSlug(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "empresa"}-${suffix}`;
}

export function NovaEmpresaForm() {
  const router = useRouter();
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (input: Schema) => {
      const { data, error } = await authClient.organization.create({
        name: input.name.trim(),
        slug: buildSlug(input.name),
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async (data) => {
      toast.success("Empresa criada");
      if (data?.id) {
        await authClient.organization.setActive({ organizationId: data.id });
      }
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
      className="space-y-6"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="empresa-name">Nome da empresa</FieldLabel>
          <Input
            id="empresa-name"
            type="text"
            autoFocus
            placeholder="Ex.: Nasa Agents"
            disabled={createMutation.isPending}
            {...form.register("name")}
          />
          <FieldDescription>
            Aparece no switcher do sidebar e nos convites enviados aos membros.
          </FieldDescription>
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createMutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Spinner />}
          Criar empresa
        </Button>
      </div>
    </form>
  );
}
