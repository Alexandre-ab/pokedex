"use client";

import Link from "next/link";
import { useFavoritesStore } from "@/store/favorites";
import PokemonCard from "@/components/PokemonCard";

// Affiche les cartes des Pokémon mis en favori.
// Tant que le store n'a pas lu le localStorage (hasHydrated), favoriteIds
// vaut [] aussi bien côté serveur que côté client avant hydratation : le
// HTML rendu est donc identique des deux côtés, pas d'erreur d'hydratation.
export default function FavoritesList({ pokemonList }) {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const favoris = pokemonList.filter((pokemon) =>
    favoriteIds.includes(pokemon.id)
  );

  if (favoris.length === 0) {
    return (
      <div className="text-center">
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">
          Aucun Pokémon en favori
        </p>
        <Link href="/" className="text-sm text-zinc-700 hover:underline dark:text-zinc-300">
          ← Retour au Pokédex
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {favoris.map((pokemon) => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
}
