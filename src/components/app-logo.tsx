"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AppLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logoSrc =
    resolvedTheme === "dark" ? "/icone-dark.png" : "/icone-dark.png";

  return (
    <div className="relative w-full ">
      <img
        src={logoSrc}
        alt="Logo"
        className="bg-contain bg-center size-full"
      />
    </div>
  );
}
