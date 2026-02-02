"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
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
import {
  useQueryNotifications,
  useSuspenseNotifications,
} from "@/features/notifications/hooks/use-notification";
import { useUpdateProfile } from "@/features/user/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { BellIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(3, "Campo obrigatório"),
  email: z.email("Email inválido"),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export const ProfileTab = () => {
  const { data: session } = authClient.useSession();
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: ProfileSchema) => {
    updateProfile.mutate({
      name: data.name,
    });
  };

  useEffect(() => {
    if (session) {
      form.reset(
        {
          name: session.user.name ?? "",
          email: session.user.email ?? "",
        },
        {
          keepDefaultValues: true,
        },
      );
    }
  }, [session, form]);

  const formIsUpdated = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

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
  return (
    <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
      <div className="rounded-lg flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
        <div className="space-y-4">
          <div>
            <h2 className="font-medium">Free</h2>
            <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
            <p className="text-muted-foreground text-sm">Per editor</p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="">Get Started</Link>
          </Button>

          <hr className="border-dashed" />

          <ul className="list-outside space-y-3 text-sm">
            {[
              "Basic Analytics Dashboard",
              "5GB Cloud Storage",
              "Email and Chat Support",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckIcon className="size-3" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dark:bg-muted rounded-lg border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="font-medium">Pro</h2>
              <span className="my-3 block text-2xl font-semibold">
                $19 / mo
              </span>
              <p className="text-muted-foreground text-sm">Per editor</p>
            </div>

            <Button asChild className="w-full">
              <Link href="">Get Started</Link>
            </Button>
          </div>

          <div>
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
          <TabsTrigger value="plan">Plano</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab />
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
