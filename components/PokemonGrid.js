"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { searchPokemon, filterByType } from "@/lib/filters";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
import PokemonCard from "@/components/PokemonCard";

// Grille des Pokémon avec recherche (nom/numéro) et filtre par type.
export default function PokemonGrid({ pokemonList, types, typeMap }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  // Ouverture du panneau de types (contrôlée pour le refermer après un choix).
  const [open, setOpen] = useState(false);

  // Nom français d'un type (repli sur l'identifiant de l'API).
  const typeLabel = (type) => TYPE_STYLES[type]?.label ?? type;

  // Sélectionne (ou efface avec null) un type, puis referme le panneau.
  const choisirType = (type) => {
    setSelectedType(type);
    setOpen(false);
  };

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
      {/* Ligne unique : recherche (flex-1) + filtre par type (shrink-0). */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
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

        <div className="flex shrink-0 items-center gap-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button variant="outline" className="h-10 gap-2 px-3" />}
              aria-label={
                selectedType
                  ? `Filtre de type : ${typeLabel(selectedType)}`
                  : "Filtrer par type"
              }
            >
              {selectedType ? (
                <>
                  {/* Point coloré du type actif */}
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: `var(--type-${selectedType})` }}
                  />
                  {typeLabel(selectedType)}
                </>
              ) : (
                <>
                  <SlidersHorizontal aria-hidden="true" />
                  Type
                </>
              )}
              <ChevronDown aria-hidden="true" className="text-muted-foreground" />
            </PopoverTrigger>

            <PopoverContent className="w-72 p-3 sm:w-80">
              {/* En-tête : titre + remise à zéro quand un type est actif */}
              <div className="flex h-6 items-center justify-between">
                <PopoverTitle className="text-xs text-muted-foreground">
                  Filtrer par type
                </PopoverTitle>
                {selectedType && (
                  <button
                    type="button"
                    onClick={() => choisirType(null)}
                    className="rounded text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Grille 3 colonnes : 18 types = 6 lignes parfaites */}
              <div className="grid grid-cols-3 gap-1.5">
                {types.map((type) => {
                  const actif = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={actif}
                      onClick={() => choisirType(actif ? null : type)}
                      className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                        actif
                          ? `border-transparent ${TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}`
                          : "border-border bg-muted/40 hover:bg-muted"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: `var(--type-${type})` }}
                      />
                      <span className="truncate">{typeLabel(type)}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Effacer le filtre en 1 clic, sans rouvrir le panneau */}
          {selectedType && (
            <Button
              variant="outline"
              size="icon"
              className="size-10"
              aria-label="Effacer le filtre de type"
              onClick={() => setSelectedType(null)}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

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
