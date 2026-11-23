"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites";

// En-tête global avec les liens Pokédex et Favoris.
// C'est ici qu'on déclenche la réhydratation du store des favoris (une
// seule fois, après le montage côté client), puisque Header est présent
// sur toutes les pages via app/layout.js.
export default function Header() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
  }, []);

  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  // Avant l'hydratation, on affiche toujours 0 pour que le serveur et le
  // client rendent exactement le même HTML.
  const nombreAffiche = hasHydrated ? favoriteCount : 0;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
        >
          Pokédex
        </Link>
        <Link
          href="/favoris"
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Favoris ({nombreAffiche})
        </Link>
      </nav>
    </header>
  );
}
