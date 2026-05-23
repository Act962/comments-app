"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerProcessTask } from "./actions";

type LastRun = {
  id: string;
  eventIds: string[];
  sentAt: string;
};

export default function TestInngestPage() {
  const [isPending, startTransition] = useTransition();
  const [lastRun, setLastRun] = useState<LastRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await triggerProcessTask(formData);
        setLastRun({
          id: res.id,
          eventIds: res.eventIds,
          sentAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="font-semibold text-3xl tracking-tight">Teste Inngest</h1>
        <p className="text-muted-foreground text-sm">
          Dispara o evento <code>app/task.created</code> para a função{" "}
          <code>process-task</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disparar evento</CardTitle>
          <CardDescription>
            Informe um id para o task ou deixe em branco para gerar
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="id">Task id</Label>
              <Input
                id="id"
                name="id"
                placeholder="ex: task-123 (opcional)"
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar evento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {lastRun && (
        <Card>
          <CardHeader>
            <CardTitle>Último evento enviado</CardTitle>
            <CardDescription>
              Acompanhe a execução no dashboard do Inngest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Task id</dt>
              <dd className="font-mono">{lastRun.id}</dd>
              <dt className="text-muted-foreground">Event id(s)</dt>
              <dd className="font-mono break-all">
                {lastRun.eventIds.join(", ")}
              </dd>
              <dt className="text-muted-foreground">Enviado em</dt>
              <dd className="font-mono">{lastRun.sentAt}</dd>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
