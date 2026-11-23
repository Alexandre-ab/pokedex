"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// next-themes lit le localStorage de façon SYNCHRONE dès le tout premier
// rendu client (pas après, dans un effet) : `resolvedTheme` n'est donc pas
// `undefined` à ce moment-là, contrairement à ce qu'on pourrait croire — il
// vaut déjà le vrai thème, différent du rendu serveur (qui ne connaît pas
// le thème), d'où une erreur d'hydratation si on l'utilise directement.
// `useSyncExternalStore` est le moyen propre de savoir "est-on hydraté ?" :
// il renvoie `false` au rendu serveur (`getServerSnapshot`) et `true` au
// premier rendu client (`getSnapshot`), et déclenche lui-même le re-rendu
// nécessaire après l'hydratation — sans `useState`+`useEffect` (qui
// déclencherait la règle ESLint react-hooks/set-state-in-effect).
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Bouton clair/sombre. Avant d'être monté côté client, on affiche toujours
// la même icône (désactivée), pour que le HTML serveur et le premier rendu
// client soient identiques — zéro erreur d'hydratation.
export default function ThemeToggle() {
  const hasMounted = useHasMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!hasMounted) {
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
