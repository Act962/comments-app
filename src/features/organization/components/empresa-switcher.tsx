"use client";

import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export function EmpresaSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  const { data: organizations, isPending: listPending } =
    authClient.useListOrganizations();
  const { data: activeOrg, isPending: activePending } =
    authClient.useActiveOrganization();

  const isPending = listPending || activePending;

  async function handleSelect(organizationId: string) {
    if (organizationId === activeOrg?.id) return;
    setSwitching(organizationId);
    const { error } = await authClient.organization.setActive({
      organizationId,
    });
    setSwitching(null);
    if (error) {
      toast.error(error.message ?? "Não foi possível trocar de empresa");
      return;
    }
    router.refresh();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPending ? (
                <Skeleton className="h-8 w-full rounded-lg" />
              ) : (
                <>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <BuildingIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeOrg?.name ?? "Sem empresa"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Empresa
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={12}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Empresas
            </DropdownMenuLabel>
            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSelect(org.id)}
                className="cursor-pointer gap-2"
                disabled={switching === org.id}
              >
                <BuildingIcon className="size-4" />
                <span className="flex-1 truncate">{org.name}</span>
                {org.id === activeOrg?.id && <CheckIcon className="size-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href="/empresas/nova" prefetch>
                <PlusIcon className="size-4" />
                Nova empresa
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
