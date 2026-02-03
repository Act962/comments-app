"use client";

import { useTheme } from "next-themes";

export function AppLogo() {
  const { theme } = useTheme();

  return (
    <div className="relative w-full ">
      {theme === "dark" ? (
        <img
          src="/icone-dark.png"
          alt="Logo"
          className="w-full bg-contain bg-center h-full"
        />
      ) : (
        <img
          src="/icone.png"
          alt="Logo"
          className="w-full bg-contain bg-center h-full"
        />
      )}
    </div>
  );
}
