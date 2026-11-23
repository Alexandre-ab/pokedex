import { ViewTransition } from "react";
import PokemonDetailSkeleton from "@/components/PokemonDetailSkeleton";

// Affiché pendant que la fiche détaillée (app/pokemon/[id]/page.js) charge
// ses données. Reprend le même type de transition que la navigation qui a
// mené ici (depuis la grille ou via Précédent/Suivant), sinon un simple
// glissement vers le bas.
export default function Loading() {
  return (
    <ViewTransition
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "slide-down" }}
    >
      <PokemonDetailSkeleton />
    </ViewTransition>
  );
}
