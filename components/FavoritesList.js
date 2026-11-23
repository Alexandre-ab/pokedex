"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Aucun Pokémon en favori</p>
        <Button variant="outline" render={<Link href="/" />} nativeButton={false}>
          <ArrowLeft data-icon="inline-start" />
          Retour au Pokédex
        </Button>
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
