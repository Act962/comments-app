"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.email("Email inválido"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    // Better Auth redireciona o usuário de /api/auth/reset-password/{token}
    // para `redirectTo` adicionando `?token=...` (ou `?error=INVALID_TOKEN`).
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });
    if (error) {
      toast.error("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }
    setSubmittedEmail(data.email);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
                <p className="text-muted-foreground text-balance">
                  Informe seu e-mail e enviaremos um link para redefinir sua
                  senha.
                </p>
              </div>
              {submittedEmail ? (
                <Field>
                  <p className="text-sm text-muted-foreground">
                    Se houver uma conta com{" "}
                    <strong className="text-foreground">
                      {submittedEmail}
                    </strong>
                    , você receberá um e-mail com instruções em alguns minutos.
                    Verifique também a caixa de spam.
                  </p>
                </Field>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      disabled={isSubmitting}
                      {...form.register("email")}
                    />
                    <FieldError>
                      {form.formState.errors.email?.message}
                    </FieldError>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Spinner />}
                      Enviar link
                    </Button>
                  </Field>
                </>
              )}
              <FieldDescription className="text-center">
                Lembrou da senha? <Link href="/login">Voltar para login</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ao clicar em continuar, você concorda com nossa{" "}
        <Link href="/privacy-policy">Política de Privacidade</Link>.
      </FieldDescription>
    </div>
  );
}
