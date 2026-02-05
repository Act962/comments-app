"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ComponentProps, useEffect, useState } from "react";

interface AppLogoProps extends ComponentProps<"img"> {}

export function AppLogo({ className, ...props }: AppLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "dark" ? "/icone-dark.png" : "/icone-dark.png";

  return (
    <img
      src={logoSrc}
      alt="Logo"
      className={cn("bg-contain bg-center size-full", className)}
      {...props}
    />
  );
}
