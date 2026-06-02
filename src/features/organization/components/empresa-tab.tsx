"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  CopyIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";

const renameSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120, "Nome muito longo"),
});
type RenameSchema = z.infer<typeof renameSchema>;

const inviteSchema = z.object({
  email: z.email("E-mail inválido"),
  role: z.enum(["admin", "member"]),
});
type InviteSchema = z.infer<typeof inviteSchema>;

function roleLabel(role: string) {
  if (role === "owner") return "Dono";
  if (role === "admin") return "Administrador";
  return "Membro";
}

function statusLabel(status: string) {
  if (status === "pending") return "Pendente";
  if (status === "accepted") return "Aceito";
  if (status === "canceled") return "Revogado";
  if (status === "rejected") return "Recusado";
  if (status === "expired") return "Expirado";
  return status;
}

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "pending") return "default";
  if (status === "accepted") return "secondary";
  return "outline";
}

export const EmpresaTab = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: activeOrg, isPending: orgPending } =
    authClient.useActiveOrganization();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const fullOrgQuery = useQuery({
    queryKey: ["organization", "full", activeOrg?.id],
    enabled: Boolean(activeOrg?.id),
    queryFn: async () => {
      const { data, error } = await authClient.organization.getFullOrganization(
        {
          query: { organizationId: activeOrg?.id ?? "" },
        },
      );
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const invitationsQuery = useQuery({
    queryKey: ["organization", "invitations", activeOrg?.id],
    enabled: Boolean(activeOrg?.id),
    queryFn: async () => {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId: activeOrg?.id ?? "" },
      });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;
  const currentMember = fullOrgQuery.data?.members?.find(
    (m) => m.userId === currentUserId,
  );
  const isOwner = currentMember?.role === "owner";
  const isAdmin = currentMember?.role === "admin";
  const canManage = isOwner || isAdmin;

  const renameForm = useForm<RenameSchema>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (activeOrg?.name) {
      renameForm.reset({ name: activeOrg.name }, { keepDefaultValues: true });
    }
  }, [activeOrg?.name, renameForm]);

  const renameMutation = useMutation({
    mutationFn: async (input: RenameSchema) => {
      if (!activeOrg?.id) throw new Error("Sem empresa ativa");
      const { error } = await authClient.organization.update({
        data: { name: input.name },
        organizationId: activeOrg.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Empresa renomeada");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const inviteForm = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" },
  });

  const inviteMutation = useMutation({
    mutationFn: async (input: InviteSchema) => {
      const { error } = await authClient.organization.inviteMember({
        email: input.email,
        role: input.role,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Convite enviado");
      inviteForm.reset({ email: "", role: "member" });
      setInviteOpen(false);
      invitationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Membro removido");
      fullOrgQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const roleMutation = useMutation({
    mutationFn: async (input: { memberId: string; role: "admin" | "member" }) => {
      const { error } = await authClient.organization.updateMemberRole({
        memberId: input.memberId,
        role: input.role,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Função atualizada");
      fullOrgQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrg?.id) throw new Error("Sem empresa ativa");
      const { error } = await authClient.organization.leave({
        organizationId: activeOrg.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Você saiu da empresa");
      setLeaveConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Convite revogado");
      invitationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteInvitationMutation = useMutation(
    trpc.organization.deleteInvitation.mutationOptions({
      onSuccess: () => {
        toast.success("Convite excluído");
        invitationsQuery.refetch();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  async function handleCopyLink(invitationId: string) {
    try {
      const link = `${window.location.origin}/accept-invitation/${invitationId}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(invitationId);
      toast.success("Link copiado");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Falha ao copiar");
    }
  }

  if (orgPending || !activeOrg) {
    return (
      <div className="mt-4 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const inviteDialog = (
    <Dialog
      open={inviteOpen}
      onOpenChange={(open) => {
        setInviteOpen(open);
        if (!open) inviteForm.reset({ email: "", role: "member" });
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          Convidar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail para esta empresa.
          </DialogDescription>
        </DialogHeader>
        <form
          id="invite-member-form"
          onSubmit={inviteForm.handleSubmit((data) =>
            inviteMutation.mutate(data),
          )}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-email">E-mail</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemplo.com"
                disabled={inviteMutation.isPending}
                {...inviteForm.register("email")}
              />
              <FieldError>
                {inviteForm.formState.errors.email?.message}
              </FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Função</FieldLabel>
              <Select
                value={inviteForm.watch("role")}
                onValueChange={(value) =>
                  inviteForm.setValue("role", value as "admin" | "member")
                }
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setInviteOpen(false)}
            disabled={inviteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="invite-member-form"
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending && <Spinner />}
            Enviar convite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const visibleInvitations = (invitationsQuery.data ?? []).filter(
    (inv) => inv.status !== "accepted",
  );

  return (
    <div className="mt-4 space-y-8">
      <section className="space-y-4">
        <header>
          <h3 className="text-base font-medium">Detalhes</h3>
          <p className="text-sm text-muted-foreground">
            Informações da empresa ativa.
          </p>
        </header>
        <form
          onSubmit={renameForm.handleSubmit((data) => renameMutation.mutate(data))}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="empresa-nome">Nome</FieldLabel>
              <Input
                id="empresa-nome"
                type="text"
                disabled={!canManage || renameMutation.isPending}
                {...renameForm.register("name")}
              />
              <FieldError>
                {renameForm.formState.errors.name?.message}
              </FieldError>
            </Field>
          </FieldGroup>
          {canManage && (
            <Button
              type="submit"
              disabled={
                renameMutation.isPending || !renameForm.formState.isDirty
              }
            >
              {renameMutation.isPending && <Spinner />}
              Salvar
            </Button>
          )}
        </form>
      </section>

      <Tabs defaultValue="membros">
        <TabsList>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="convites">Convites</TabsTrigger>
        </TabsList>

        <TabsContent value="membros" className="space-y-4">
          {fullOrgQuery.isPending ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : fullOrgQuery.data?.members?.length ? (
            <ul className="divide-y rounded-md border">
              {fullOrgQuery.data.members.map((member) => {
                const isSelf = member.userId === currentUserId;
                const isMemberOwner = member.role === "owner";
                const initials = (member.user?.name ?? member.user?.email ?? "")
                  .charAt(0)
                  .toUpperCase();
                return (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {member.user?.name ?? "—"}
                        {isSelf && (
                          <span className="text-muted-foreground"> (você)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {roleLabel(member.role)}
                    </div>
                    {(canManage && !isMemberOwner) || isSelf ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwner && !isSelf && member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                roleMutation.mutate({
                                  memberId: member.id,
                                  role: "admin",
                                })
                              }
                            >
                              Tornar administrador
                            </DropdownMenuItem>
                          )}
                          {isOwner && !isSelf && member.role === "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                roleMutation.mutate({
                                  memberId: member.id,
                                  role: "member",
                                })
                              }
                            >
                              Tornar membro
                            </DropdownMenuItem>
                          )}
                          {canManage && !isSelf && !isMemberOwner && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeMutation.mutate(member.id)}
                            >
                              <Trash2Icon className="size-4" />
                              Remover
                            </DropdownMenuItem>
                          )}
                          {isSelf && !isOwner && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setLeaveConfirmOpen(true)}
                            >
                              <LogOutIcon className="size-4" />
                              Sair da empresa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nenhum membro</EmptyTitle>
                <EmptyDescription>
                  Convide alguém pela aba Convites.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>

        <TabsContent value="convites" className="space-y-4">
          {canManage && (
            <div className="flex justify-end">{inviteDialog}</div>
          )}

          {invitationsQuery.isPending ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : visibleInvitations.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nenhum convite</EmptyTitle>
                <EmptyDescription>
                  {canManage
                    ? "Clique em Convidar para enviar um convite por e-mail."
                    : "Não há convites para esta empresa."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y rounded-md border">
              {visibleInvitations.map((inv) => {
                const status = inv.status as string;
                const pending = status === "pending";
                const canDelete =
                  canManage &&
                  (status === "canceled" ||
                    status === "rejected" ||
                    status === "expired");
                return (
                  <li
                    key={inv.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{inv.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {roleLabel(inv.role ?? "member")}
                      </div>
                    </div>
                    <Badge variant={statusVariant(inv.status)}>
                      {statusLabel(inv.status)}
                    </Badge>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        {pending && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(inv.id)}
                            >
                              {copiedId === inv.id ? (
                                <CheckIcon className="size-4" />
                              ) : (
                                <CopyIcon className="size-4" />
                              )}
                              Copiar link
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                cancelInvitationMutation.mutate(inv.id)
                              }
                              disabled={cancelInvitationMutation.isPending}
                            >
                              <XIcon className="size-4" />
                              Revogar
                            </Button>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteInvitationMutation.mutate({
                                invitationId: inv.id,
                              })
                            }
                            disabled={deleteInvitationMutation.isPending}
                          >
                            <Trash2Icon className="size-4" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {!isOwner && (
        <section className="space-y-4 border-t pt-6">
          <header>
            <h3 className="text-base font-medium">Sair da empresa</h3>
            <p className="text-sm text-muted-foreground">
              Você perderá acesso aos dados desta empresa.
            </p>
          </header>
          <Button
            variant="destructive"
            onClick={() => setLeaveConfirmOpen(true)}
          >
            Sair
          </Button>
        </section>
      )}

      <AlertDialog
        open={leaveConfirmOpen}
        onOpenChange={(open) => {
          if (leaveMutation.isPending) return;
          setLeaveConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá acesso a automações, integrações e dados de{" "}
              <strong>{activeOrg.name}</strong>. Para voltar, será necessário um
              novo convite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaveMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={leaveMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                leaveMutation.mutate();
              }}
            >
              {leaveMutation.isPending && <Spinner />}
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
