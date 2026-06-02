"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { InvalidateOnOrgChange } from "@/features/organization/components/invalidate-on-org-change";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <InvalidateOnOrgChange />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
