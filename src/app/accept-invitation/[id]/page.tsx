"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

type AcceptStatus =
  | "checking"
  | "anonymous"
  | "accepting"
  | "success"
  | "error";

export default function AcceptInvitationPage({ params }: PageProps) {
  const { id: invitationId } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<AcceptStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Caminho que login/registro devem voltar — o próprio convite.
  const redirectPath = `/accept-invitation/${invitationId}`;
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(redirectPath)}`;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      // Chamada one-shot: resolve com `{ data: null }` quando não há sessão,
      // sem depender do flag reativo `isPending` (que pode ficar travado).
      const sessionResult = await authClient.getSession();
      if (cancelled) return;

      const session = sessionResult.data;
      if (!session) {
        setStatus("anonymous");
        return;
      }

      setStatus("accepting");
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (cancelled) return;
      if (error) {
        setStatus("error");
        setErrorMessage(error.message ?? "Convite inválido ou expirado");
        return;
      }
      if (data?.invitation?.organizationId) {
        await authClient.organization.setActive({
          organizationId: data.invitation.organizationId,
        });
      }
      setStatus("success");
      toast.success("Convite aceito");
      router.replace("/dashboard");
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [invitationId, router]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        {status === "anonymous" ? (
          <>
            <CardHeader>
              <CardTitle>Você foi convidado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para aceitar este convite, entre com sua conta ou crie uma
                gratuitamente. Use o mesmo e-mail em que recebeu o convite.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="w-full">
                  <Link href={loginHref}>Entrar</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={registerHref}>Criar conta</Link>
                </Button>
              </div>
            </CardContent>
          </>
        ) : status === "error" ? (
          <CardContent className="space-y-4 p-6 text-center">
            <h2 className="text-lg font-medium">Não foi possível aceitar</h2>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => router.replace("/dashboard")}>
              Voltar ao painel
            </Button>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Spinner />
            <p className="text-sm text-muted-foreground">
              {status === "checking"
                ? "Verificando sessão..."
                : "Aceitando convite..."}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
