"use client";

import { LogoIcon } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(3, "Campo obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignUp = async (data: RegisterSchema) => {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          form.reset();
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Erro ao criar conta");
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSignUp)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Crie sua conta</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Insira seu email abaixo para criar sua conta
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  disabled={isSubmitting}
                  {...form.register("name")}
                />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isSubmitting}
                  {...form.register("email")}
                />
                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
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
                      Confirme sua senha
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
                  </Field>
                </Field>
                <FieldDescription>
                  Deve ter pelo menos 6 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Criar Conta
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continuar com
              </FieldSeparator>
              <Field className="">
                <Button
                  variant="outline"
                  type="button"
                  className="col-span-3"
                  disabled={isSubmitting}
                  onClick={handleGoogleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Sign up with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Já tem uma conta? <Link href="/login">Faça login</Link>
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
        Ao clicar em continuar, você concorda com nossos{" "}
        <Link href="/terms">Termos de Serviço</Link> e{" "}
        <Link href="/privacy-policy">Política de Privacidade</Link>.
      </FieldDescription>
    </div>
  );
}
