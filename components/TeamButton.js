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
// "showLabel" : sur la fiche détaillée, le bouton affiche aussi un texte
// et un style nettement différent selon l'état actif. Sur les cartes de
// la grille (par défaut), il devient un bouton arrondi de la carte (icône seule).
export default function TeamButton({ id, showLabel = false }) {
  const hasHydrated = useTeamStore((state) => state.hasHydrated);
  const isInTeam = useTeamStore((state) => state.teamIds.includes(id));
  const add = useTeamStore((state) => state.add);
  const remove = useTeamStore((state) => state.remove);

  // Avant hydratation, on affiche toujours "pas dans la sacoche" pour que
  // le rendu serveur et le premier rendu client soient identiques.
  const estDansLaSacoche = hasHydrated && isInTeam;
  const libelle = estDansLaSacoche ? "Retirer de la sacoche" : "Ajouter à la sacoche";

  function handleClick(event) {
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
  }

  if (showLabel) {
    return (
      <Button
        type="button"
        variant={estDansLaSacoche ? "default" : "outline"}
        onClick={handleClick}
        aria-label={libelle}
        title={libelle}
      >
        <Backpack data-icon="inline-start" className={estDansLaSacoche ? "fill-current" : ""} />
        {estDansLaSacoche ? "Dans la sacoche" : "Ajouter à la sacoche"}
      </Button>
    );
  }

  // Version compacte (cartes de la grille) : un bouton arrondi
  // de la carte — pleine largeur, 44 px de haut, icône seule.
  // Le libellé reste lu par les lecteurs d'écran (aria-label).
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      aria-label={libelle}
      // data-actif sert au style (le libellé dit déjà l'état).
      data-actif={estDansLaSacoche ? "true" : undefined}
      title={libelle}
      className="min-h-11 w-full rounded-xl bg-accent/60 text-muted-foreground hover:bg-accent hover:text-foreground data-[actif=true]:bg-primary data-[actif=true]:text-primary-foreground data-[actif=true]:hover:bg-primary/85 data-[actif=true]:hover:text-primary-foreground"
    >
      <Backpack />
    </Button>
  );
}
