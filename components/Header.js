"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";

// En-tête global avec les liens Pokédex, Favoris et Sacoche.
// C'est ici qu'on déclenche la réhydratation des stores des favoris et de
// la sacoche (une seule fois, après le montage côté client), puisque Header
// est présent sur toutes les pages via app/layout.js.
export default function Header() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    useTeamStore.persist.rehydrate();
  }, []);

  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  const teamHasHydrated = useTeamStore((state) => state.hasHydrated);
  const teamCount = useTeamStore((state) => state.teamIds.length);
  const lastMessage = useTeamStore((state) => state.lastMessage);
  const clearMessage = useTeamStore((state) => state.clearMessage);

  // Avant l'hydratation, on affiche toujours 0 pour que le serveur et le
  // client rendent exactement le même HTML.
  const nombreFavoris = hasHydrated ? favoriteCount : 0;
  const nombreDansLaSacoche = teamHasHydrated ? teamCount : 0;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
        >
          Pokédex
        </Link>
        <div className="flex gap-4">
          <Link
            href="/favoris"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Favoris ({nombreFavoris})
          </Link>
          <Link
            href="/sacoche"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Sacoche ({nombreDansLaSacoche}/{MAX_TEAM_SIZE})
          </Link>
        </div>
      </nav>

      {lastMessage && (
        <div className="flex items-center justify-between gap-4 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          <p>{lastMessage}</p>
          <button
            type="button"
            onClick={clearMessage}
            aria-label="Fermer le message"
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}
    </header>
  );
}
