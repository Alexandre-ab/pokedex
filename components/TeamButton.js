"use client";

import { toast } from "sonner";
import { Backpack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/store/team";

// Bouton pour ajouter/retirer un Pokémon de la sacoche.
// On ne désactive jamais le bouton "Ajouter" quand la sacoche est pleine :
// on laisse add(id) être appelé, le store refuse et renvoie une raison,
// qu'on affiche ici avec un toast (sonner) — la limite de 6 reste décidée
// par le store, pas par ce composant.
export default function TeamButton({ id }) {
  const hasHydrated = useTeamStore((state) => state.hasHydrated);
  const isInTeam = useTeamStore((state) => state.teamIds.includes(id));
  const add = useTeamStore((state) => state.add);
  const remove = useTeamStore((state) => state.remove);

  // Avant hydratation, on affiche toujours "pas dans la sacoche" pour que
  // le rendu serveur et le premier rendu client soient identiques.
  const estDansLaSacoche = hasHydrated && isInTeam;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(event) => {
        // On empêche le clic de déclencher le lien de la carte en dessous.
        event.preventDefault();
        event.stopPropagation();
        if (estDansLaSacoche) {
          remove(id);
          return;
        }
        const result = add(id);
        if (!result.ok) {
          toast.error(result.reason);
        }
      }}
      aria-label={estDansLaSacoche ? "Retirer de la sacoche" : "Ajouter à la sacoche"}
      className="rounded-full bg-background/80 shadow"
    >
      <Backpack
        className={estDansLaSacoche ? "fill-secondary text-secondary-foreground" : "text-muted-foreground"}
      />
    </Button>
  );
}
