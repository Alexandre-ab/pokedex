"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// Bouton clair/sombre. next-themes ne connaît le vrai thème qu'une fois
// monté côté client (il lit le localStorage) : avant ça, `resolvedTheme`
// vaut `undefined`, aussi bien côté serveur que lors du tout premier rendu
// client — on affiche alors toujours la même icône (désactivée), pour que
// les deux rendus soient identiques, zéro erreur d'hydratation. Pas besoin
// d'un état local : next-themes met lui-même à jour `resolvedTheme` une
// fois le vrai thème connu.
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  if (!resolvedTheme) {
    return (
      <Button variant="ghost" size="icon" aria-label="Changer de thème" disabled>
        <Sun />
      </Button>
    );
  }

  const estSombre = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={estSombre ? "Passer en thème clair" : "Passer en thème sombre"}
      onClick={() => setTheme(estSombre ? "light" : "dark")}
    >
      {estSombre ? <Sun /> : <Moon />}
    </Button>
  );
}
