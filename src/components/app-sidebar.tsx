"use client";
import {
  ActivityIcon,
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CircleQuestionMarkIcon,
  Home,
  HomeIcon,
  LogOutIcon,
  RocketIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { LogoIcon } from "./marketing/logo";
import { title } from "process";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const menuItems = [
  { title: "Início", url: "/dashboard", icon: HomeIcon },
  { title: "Automações", url: "/workflows", icon: ActivityIcon },
  { title: "Integrações", url: "/integrations", icon: RocketIcon },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
  { title: "Ajuda", url: "/help", icon: CircleQuestionMarkIcon },
];

export function AppSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LogoIcon />
              <span>Comments</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(0, 4).map((item, index) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <Icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.slice(4).map((item, index) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <Icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UpgradeCard />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function UpgradeCard() {
  return (
    <Card>
      <CardContent>
        <span className="text-sm font-bold">Upgrade para o plano Pro</span>
        <p className="text-sm text-muted-foreground mt-1">
          Desbloqueie todas as funcionalidades do seu plano Pro
        </p>
        <Button className="mt-2 w-full">Assinar</Button>
      </CardContent>
    </Card>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  function getInitials(name: string): string {
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");

    return initials;
  }

  const hanldeLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPending && <Skeleton className="h-8 w-full rounded-lg" />}
              {!isPending && (
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    {session?.user.image && (
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name}
                      />
                    )}
                    {session?.user.name && (
                      <AvatarFallback className="rounded-lg">
                        {" "}
                        {getInitials(session.user.name)}{" "}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {session?.user.name && (
                      <span className="truncate font-medium">
                        {session?.user.name}
                      </span>
                    )}
                    {session?.user.email && (
                      <span className="truncate text-xs">
                        {session.user.email}
                      </span>
                    )}
                  </div>
                </>
              )}
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {session?.user.image && (
                    <AvatarImage
                      src={session?.user.image}
                      alt={session?.user.name}
                    />
                  )}
                  {session?.user.name && (
                    <AvatarFallback className="rounded-lg">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {session?.user.name && (
                    <span className="truncate font-medium">
                      {session?.user.name}
                    </span>
                  )}
                  {session?.user.email && (
                    <span className="truncate text-xs">
                      {session.user.email}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer"
              >
                <BadgeCheckIcon />
                Configurações
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <BellIcon />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={hanldeLogout}
              className="cursor-pointer"
            >
              <LogOutIcon />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
