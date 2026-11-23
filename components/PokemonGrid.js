"use client";

import { useState } from "react";
import { searchPokemon, filterByType } from "@/lib/filters";
import { TYPE_STYLES } from "@/lib/typeStyles";
import PokemonCard from "@/components/PokemonCard";

// Grille des Pokémon avec recherche (nom/numéro) et filtre par type.
export default function PokemonGrid({ pokemonList, types, typeMap }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  // On filtre d'abord par type, puis par texte recherché.
  const filteredByType = filterByType(pokemonList, typeMap, selectedType);
  const filteredList = searchPokemon(filteredByType, query);

  function handleTypeClick(type) {
    // Un clic sur le type déjà actif le retire (toggle).
    setSelectedType((current) => (current === type ? null : type));
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un Pokémon (nom ou numéro)"
        className="mb-4 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {types.map((type) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeClick(type)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity ${TYPE_STYLES[type]?.classes ?? "bg-zinc-400 text-white"} ${isSelected ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-50" : "opacity-70 hover:opacity-100"}`}
            >
              {TYPE_STYLES[type]?.label ?? type}
            </button>
          );
        })}
      </div>

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
