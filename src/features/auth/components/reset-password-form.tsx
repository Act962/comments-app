"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Better Auth coloca `?token=...` em sucesso, ou `?error=INVALID_TOKEN`
  // quando o link expirou / foi usado.
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");
  const invalid = !token || tokenError === "INVALID_TOKEN";

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error("Token inválido");
      return;
    }
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (error) {
      toast.error(
        error.message ?? "Não foi possível redefinir a senha. Tente novamente.",
      );
      return;
    }
    toast.success("Senha redefinida com sucesso!");
    router.replace("/login");
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Redefinir senha</h1>
                <p className="text-muted-foreground text-balance">
                  Crie uma nova senha para acessar sua conta.
                </p>
              </div>
              {invalid ? (
                <>
                  <Field>
                    <p className="text-sm text-muted-foreground">
                      O link expirou ou é inválido. Solicite um novo link para
                      redefinir sua senha.
                    </p>
                  </Field>
                  <Field>
                    <Button asChild>
                      <Link href="/forgot-password">Solicitar novo link</Link>
                    </Button>
                  </Field>
                </>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="password">Nova senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      disabled={isSubmitting}
                      {...form.register("password")}
                    />
                    <FieldError>
                      {form.formState.errors.password?.message}
                    </FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirme a senha
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="********"
                      disabled={isSubmitting}
                      {...form.register("confirmPassword")}
                    />
                    <FieldError>
                      {form.formState.errors.confirmPassword?.message}
                    </FieldError>
                    <FieldDescription>
                      Deve ter pelo menos 6 caracteres.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Spinner />}
                      Redefinir senha
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
