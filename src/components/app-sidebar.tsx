import {
  ActivityIcon,
  CircleQuestionMarkIcon,
  Home,
  HomeIcon,
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
} from "./ui/sidebar";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { LogoIcon } from "./marketing/logo";
import { title } from "process";

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
