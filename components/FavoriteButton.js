"use client";

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

  return (
    <button
      type="button"
      onClick={(event) => {
        // On empêche le clic de déclencher le lien de la carte en dessous.
        event.preventDefault();
        event.stopPropagation();
        toggle(id);
      }}
      aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-lg shadow dark:bg-zinc-900/80"
    >
      {estFavori ? (
        <span className="text-red-500">♥</span>
      ) : (
        <span className="text-zinc-400">♡</span>
      )}
    </button>
  );
}
