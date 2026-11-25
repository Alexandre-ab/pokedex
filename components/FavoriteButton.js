"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites";

// Bouton cœur pour ajouter/retirer un Pokémon des favoris.
// Tant que le store n'a pas fini de relire le localStorage (hasHydrated),
// on affiche toujours l'état "pas favori" pour que le HTML du serveur et
// celui du client soient identiques.
// "showLabel" : sur la fiche détaillée, le bouton affiche aussi un texte
// ("Favori") et un style nettement différent selon l'état actif. Sur les
// cartes de la grille (par défaut), il devient un bouton arrondi
// et confortable (icône seule).
export default function FavoriteButton({ id, showLabel = false }) {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(id)
  );
  const toggle = useFavoritesStore((state) => state.toggle);

  const estFavori = hasHydrated && isFavorite;
  const libelle = estFavori ? "Retirer des favoris" : "Ajouter aux favoris";

  function handleClick(event) {
    // On empêche le clic de déclencher le lien de la carte en dessous.
    event.preventDefault();
    event.stopPropagation();
    toggle(id);
  }

  if (showLabel) {
    return (
      <Button
        type="button"
        variant={estFavori ? "default" : "outline"}
        onClick={handleClick}
        aria-label={libelle}
        title={libelle}
      >
        <Heart data-icon="inline-start" className={estFavori ? "fill-current" : ""} />
        Favori
      </Button>
    );
  }

  // Version compacte (cartes de la grille) : pleine largeur, 44 px de haut,
  // icône seule. Au repos, fond transparent (carte plus légère) ; le fond
  // apparaît au survol de la carte (group-hover), du bouton (hover) ou
  // quand le Pokémon est favori (data-actif). L'icône garde le contraste
  // de muted-foreground. Le libellé reste lu par les lecteurs d'écran.
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      aria-label={libelle}
      // data-actif sert au style (le libellé dit déjà l'état).
      data-actif={estFavori ? "true" : undefined}
      title={libelle}
      className="min-h-11 w-full rounded-xl bg-transparent text-muted-foreground not-data-[actif=true]:group-hover:bg-accent/40 hover:bg-accent hover:text-foreground motion-safe:transition-colors data-[actif=true]:bg-primary/10 data-[actif=true]:text-primary"
    >
      <Heart className={estFavori ? "fill-current" : ""} />
    </Button>
  );
}
