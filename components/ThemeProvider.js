"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Fournit le thème clair/sombre (classe .dark sur <html>) à toute
// l'application, via next-themes.
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
