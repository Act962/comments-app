"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
