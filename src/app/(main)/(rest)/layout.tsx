import { headers } from "next/headers";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NoEmpresaPlaceholder } from "@/features/organization/components/no-empresa-placeholder";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)
      ?.activeOrganizationId ?? null;

  let showPlaceholder = false;
  let hasOrganizations = false;

  if (!activeOrganizationId && session?.user?.id) {
    showPlaceholder = true;
    hasOrganizations =
      (await prisma.member.count({
        where: { userId: session.user.id },
      })) > 0;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {showPlaceholder ? (
          <NoEmpresaPlaceholder hasOrganizations={hasOrganizations} />
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
