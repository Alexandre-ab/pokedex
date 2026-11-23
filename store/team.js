"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToTeam, removeFromTeam } from "@/lib/team";

// Store de la sacoche de dresseur (6 Pokémon maximum), sauvegardé dans le
// localStorage. Même piège d'hydratation que store/favorites.js : on
// désactive la lecture automatique (skipHydration) et on réhydrate nous-mêmes
// après le montage côté client (voir components/Header.js).
export const useTeamStore = create(
  persist(
    (set) => ({
      teamIds: [],
      hasHydrated: false,
      lastMessage: null,
      add: (id) => {
        let result;
        set((state) => {
          result = addToTeam(state.teamIds, id);
          return { teamIds: result.team, lastMessage: result.reason };
        });
        return result;
      },
      remove: (id) =>
        set((state) => ({
          teamIds: removeFromTeam(state.teamIds, id),
          lastMessage: null,
        })),
      clearMessage: () => set({ lastMessage: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "pokedex-team",
      partialize: (state) => ({ teamIds: state.teamIds }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
