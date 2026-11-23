"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toggleFavorite } from "@/lib/favorites";

// Store des favoris, sauvegardé dans le localStorage du navigateur.
// hasHydrated passe à true une fois que le store a relu le localStorage :
// avant ça, les composants doivent afficher un état "pas favori" pour que
// le rendu serveur et le rendu client soient identiques (zéro erreur
// d'hydratation).
export const useFavoritesStore = create(
  persist(
    (set) => ({
      favoriteIds: [],
      hasHydrated: false,
      toggle: (id) =>
        set((state) => ({
          favoriteIds: toggleFavorite(state.favoriteIds, id),
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "pokedex-favorites",
      // On ne sauvegarde que favoriteIds (pas hasHydrated ni les fonctions).
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
      // Sans ça, zustand lit le localStorage de façon synchrone dès
      // l'import du store côté client : hasHydrated serait déjà true au
      // tout premier rendu client, alors qu'il vaut false au rendu serveur.
      // On réhydrate nous-mêmes, une fois le composant monté (voir
      // components/Header.js), pour que serveur et client démarrent pareil.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
