"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites";

// Bouton cœur pour ajouter/retirer un Pokémon des favoris.
// Tant que le store n'a pas fini de relire le localStorage (hasHydrated),
// on affiche toujours l'état "pas favori" pour que le HTML du serveur et
// celui du client soient identiques.
export default function FavoriteButton({ id }) {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(id)
  );
  const toggle = useFavoritesStore((state) => state.toggle);

  const estFavori = hasHydrated && isFavorite;
  const libelle = estFavori ? "Retirer des favoris" : "Ajouter aux favoris";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(event) => {
        // On empêche le clic de déclencher le lien de la carte en dessous.
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
      aria-label={libelle}
      title={libelle}
      className="rounded-full bg-background/80 shadow"
    >
      <Heart
        className={estFavori ? "fill-destructive text-destructive" : "text-muted-foreground"}
      />
    </Button>
  );
}
