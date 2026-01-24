import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth-utils";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <AppHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}
