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

// Bouton rond (pilule avec libellé), cible tactile d'au moins 44 px, fond
// de carte et ombre très douce ; au survol le fond devient la teinte douce.
const classesBouton =
  "h-11 min-w-11 rounded-full border-border bg-card text-foreground shadow-soft hover:bg-accent motion-safe:transition-colors motion-safe:duration-200";

// Bouton clair/sombre. Avant d'être monté côté client, on affiche toujours
// la même icône (désactivée), pour que le HTML serveur et le premier rendu
// client soient identiques — zéro erreur d'hydratation.
// `withLabel` (rail desktop) ajoute le nom du mode visé à côté de l'icône.
export default function ThemeToggle({ withLabel = false }) {
  const hasMounted = useHasMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!hasMounted) {
    return (
      <Button
        variant="ghost"
        size={withLabel ? "default" : "icon"}
        className={classesBouton}
        aria-label="Changer de thème"
        disabled
      >
        <Sun />
        {withLabel && <span className="text-sm font-medium">Thème</span>}
      </Button>
    );
  }

  const estSombre = resolvedTheme === "dark";
  const libelle = estSombre ? "Passer en thème clair" : "Passer en thème sombre";

  return (
    <Button
      type="button"
      variant="ghost"
      size={withLabel ? "default" : "icon"}
      className={classesBouton}
      aria-label={libelle}
      onClick={() => setTheme(estSombre ? "light" : "dark")}
    >
      {estSombre ? <Sun /> : <Moon />}
      {withLabel && (
        <span className="text-sm font-medium" aria-hidden="true">
          {estSombre ? "Mode clair" : "Mode sombre"}
        </span>
      )}
    </Button>
  );
}
