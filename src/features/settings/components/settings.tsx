"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
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
  Item,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryNotifications } from "@/features/notifications/hooks/use-notification";
import { EmpresaTab } from "@/features/organization/components/empresa-tab";
import {
  useBillingPortal,
  useCurrentSubscription,
  useUpgradeSubscription,
} from "@/features/subscription/hook/use-subscription";
import { useUpdateProfile } from "@/features/user/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, CheckIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(3, "Campo obrigatório"),
  email: z.email("Email inválido"),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export const ProfileTab = () => {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    // `values` mantém o form sincronizado com a sessão assíncrona sem precisar
    // de useEffect + reset. RHF faz deep-compare, então a referência nova
    // a cada render não dispara reset enquanto o conteúdo for o mesmo, e
    // estado dirty do usuário é preservado.
    values: {
      name: session?.user.name ?? "",
      email: session?.user.email ?? "",
    },
  });

  const onSubmit = async (data: ProfileSchema) => {
    updateProfile.mutate({
      name: data.name,
    });
  };

  const isSubmitting = form.formState.isSubmitting;

  if (sessionPending && !session) {
    return (
      <div className="mt-4 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
      <Avatar className="size-20">
        <AvatarImage src={session?.user?.image ?? ""} />
        <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
      </Avatar>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            type="text"
            disabled={isSubmitting}
            placeholder="Seu nome"
            {...form.register("name")}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" type="email" disabled {...form.register("email")} />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Salvar
      </Button>
    </form>
  );
};

export const PlanTab = () => {
  const { subscription, isLoading } = useCurrentSubscription();
  const upgradeSubscription = useUpgradeSubscription();
  const billingPortal = useBillingPortal();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

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

  const currentMember = fullOrgQuery.data?.members?.find(
    (m) => m.userId === session?.user.id,
  );
  const isOwner = currentMember?.role === "owner";
  const roleResolved = !fullOrgQuery.isPending;
  const canManagePlan = isOwner;

  const onUpgrade = () => {
    upgradeSubscription.mutate({
      plan: "pro",
      callbackUrl: `${window.location.origin}/settings`,
    });
  };

  const onBillingPortal = () => {
    billingPortal.mutate({
      callbackUrl: `${window.location.origin}/settings`,
    });
  };

  // const portalLink = process.env.NEXT_PUBLIC_STRIPE_PORTAL_LINK;

  return (
    <div className="mt-4 space-y-6">
      {roleResolved && !isOwner && !subscription?.isInherited && (
        <Alert>
          <LockIcon />
          <AlertTitle>Apenas o dono da empresa pode gerenciar o plano</AlertTitle>
          <AlertDescription>
            Para assinar, alterar ou cancelar o plano da empresa{" "}
            {activeOrg?.name ? <strong>{activeOrg.name}</strong> : "ativa"}, peça
            ao dono. Você pode ver o plano vigente, mas não realizar mudanças de
            cobrança.
          </AlertDescription>
        </Alert>
      )}

      {subscription?.isInherited && (
        <Alert>
          <LockIcon />
          <AlertTitle>Plano herdado</AlertTitle>
          <AlertDescription>
            Esta empresa usa o plano da empresa{" "}
            {subscription.sourceOrganization?.name ? (
              <strong>{subscription.sourceOrganization.name}</strong>
            ) : (
              "principal"
            )}
            . Um único pagamento cobre todas as empresas do mesmo dono. Para
            gerenciar a cobrança, troque para a empresa de origem no seletor.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-5 md:gap-0">
        <div className="dark:bg-muted rounded-lg border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Pro</h2>
                <span className="my-3 block text-2xl font-semibold">
                  R$ 79,90 / mo
                </span>
                <p className="text-muted-foreground text-sm">
                  {activeOrg?.name
                    ? `Plano da empresa ${activeOrg.name}`
                    : "Plano por empresa"}
                </p>
              </div>

              {subscription?.subscription.plan === "pro" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onBillingPortal}
                  disabled={!canManagePlan || subscription.isInherited}
                >
                  Gerenciar
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={onUpgrade}
                  disabled={!canManagePlan}
                >
                  Assinar
                </Button>
              )}
            </div>

            {/* <div>
              <div className="text-sm font-medium">Everything in free plus :</div>

              <ul className="mt-4 list-outside space-y-3 text-sm">
                {[
                  "Everything in Free Plan",
                  "5GB Cloud Storage",
                  "Email and Chat Support",
                  "Access to Community Forum",
                  "Single User Access",
                  "Access to Basic Templates",
                  "Mobile App Access",
                  "1 Custom Report Per Month",
                  "Monthly Product Updates",
                  "Standard Security Features",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckIcon className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationsTab = () => {
  const { notifications, isLoading } = useQueryNotifications();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center mt-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mt-4">
      {notifications.length === 0 ? (
        <Empty className="bg-muted/30 h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma notificação</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              Você está em dia. Novas notificações aparecerão aqui.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {notifications.map((notification) => {
            return (
              <Item key={notification.id}>
                <ItemHeader>
                  <ItemTitle>{notification.title}</ItemTitle>
                  <ItemDescription>{notification.message}</ItemDescription>
                </ItemHeader>
              </Item>
            );
          })}
        </>
      )}
    </div>
  );
};

export const SettingsContent = () => {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "profile" });

  return (
    <div>
      <Tabs defaultValue={tab} onValueChange={(value) => setTab(value)}>
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="plan">Plano</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="empresa">
          <EmpresaTab />
        </TabsContent>
        <TabsContent value="plan">
          <PlanTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const SettingsHeader = () => {
  return (
    <EntityHeader
      title="Configurações"
      description="Gerencie suas configurações"
      disabled={false}
      isCreating={false}
    />
  );
};

export const SettingsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer header={<SettingsHeader />}>{children}</EntityContainer>
  );
};
