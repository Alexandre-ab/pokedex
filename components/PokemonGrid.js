"use client";

import { useState } from "react";
import { searchPokemon, filterByType } from "@/lib/filters";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import PokemonCard from "@/components/PokemonCard";

// Grille des Pokémon avec recherche (nom/numéro) et filtre par type.
export default function PokemonGrid({ pokemonList, types, typeMap }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  // On filtre d'abord par type, puis par texte recherché.
  const filteredByType = filterByType(pokemonList, typeMap, selectedType);
  const filteredList = searchPokemon(filteredByType, query);

  return (
    <div>
      <label htmlFor="pokemon-search" className="sr-only">
        Rechercher un Pokémon par nom ou par numéro
      </label>
      <Input
        id="pokemon-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un Pokémon (nom ou numéro)"
        className="mb-4 h-10"
      />

      <div className="mb-6 flex justify-center">
        <ToggleGroup
          aria-label="Filtrer les Pokémon par type"
          value={selectedType ? [selectedType] : []}
          onValueChange={(values) => setSelectedType(values[0] ?? null)}
          spacing={2}
          className="flex-wrap justify-center"
        >
          {types.map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              className="h-auto min-w-0 rounded-full bg-transparent p-0 hover:bg-transparent data-[state=on]:bg-transparent data-[state=off]:opacity-60 data-[state=on]:opacity-100 data-[state=on]:ring-2 data-[state=on]:ring-foreground hover:opacity-100"
            >
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}`}
              >
                {TYPE_STYLES[type]?.label ?? type}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filteredList.length === 0 ? (
        <p className="text-center text-muted-foreground">
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
