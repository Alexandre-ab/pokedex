"use client";

import { useState } from "react";
import { searchPokemon } from "@/lib/filters";
import PokemonCard from "@/components/PokemonCard";

// Grille des Pokémon avec un champ de recherche par nom ou par numéro.
export default function PokemonGrid({ pokemonList }) {
  const [query, setQuery] = useState("");
  const filteredList = searchPokemon(pokemonList, query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un Pokémon (nom ou numéro)"
        className="mb-6 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {filteredList.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Aucun Pokémon trouvé
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}
