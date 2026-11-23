"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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

  // Compteur de résultats, annoncé aux lecteurs d'écran à chaque changement.
  const aucunFiltreActif = query.trim() === "" && !selectedType;
  const compteurTexte = aucunFiltreActif
    ? // Espace normal (pas l'espace fine de toLocaleString, peu visible) :
      // "1025" -> "1 025".
      `${pokemonList.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Pokémon`
    : `${filteredList.length} résultat${filteredList.length > 1 ? "s" : ""}`;

  return (
    <div>
      <label htmlFor="pokemon-search" className="sr-only">
        Rechercher un Pokémon par nom ou par numéro
      </label>
      <div className="relative mb-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="pokemon-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un Pokémon (nom ou numéro)"
          className="h-10 pl-9"
        />
      </div>

      {/* Pastilles serrées et centrées, toujours à pleine opacité (seul
          l'anneau rouge distingue le filtre actif) pour garder le contraste
          des pastilles inactives, y compris en mode sombre. */}
      <ToggleGroup
        aria-label="Filtrer les Pokémon par type"
        value={selectedType ? [selectedType] : []}
        onValueChange={(values) => setSelectedType(values[0] ?? null)}
        spacing={2}
        className="mb-2 flex w-full flex-wrap justify-center gap-1.5"
      >
        {types.map((type) => (
          <ToggleGroupItem
            key={type}
            value={type}
            className="h-auto min-w-0 shrink-0 rounded-full bg-transparent p-0 hover:bg-transparent aria-pressed:bg-transparent aria-pressed:ring-[3px] aria-pressed:ring-primary aria-pressed:ring-offset-2 aria-pressed:ring-offset-background"
          >
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}`}
            >
              {TYPE_STYLES[type]?.label ?? type}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <p aria-live="polite" className="mb-6 text-center text-sm text-muted-foreground">
        {compteurTexte}
      </p>

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
