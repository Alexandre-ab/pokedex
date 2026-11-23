import { ViewTransition } from "react";
import { getPokemonList, getTypes, getTypeMap } from "@/lib/pokeapi";
import PokemonGrid from "@/components/PokemonGrid";

// Page d'accueil : la grille des 1 025 Pokémon, avec recherche et filtres par type.
export default async function Home() {
  // Les trois appels sont indépendants : on les lance en parallèle.
  const [pokemonList, types, typeMap] = await Promise.all([
    getPokemonList(),
    getTypes(),
    getTypeMap(),
  ]);

  // On attache à chaque Pokémon ses types, à partir de typeMap
  // (déjà chargé en mémoire : pas de nouvel appel réseau).
  const pokemonWithTypes = pokemonList.map((pokemon) => ({
    ...pokemon,
    types: types.filter((type) => typeMap[type].includes(pokemon.id)),
  }));

  return (
    <ViewTransition enter="slide-up" default="none">
      <div className="min-h-screen bg-background px-4 py-8">
        <main id="main-content" className="mx-auto max-w-6xl">
          {/* Le nom "Pokédex" est déjà visible dans l'en-tête : on garde
              un titre de page pour la sémantique/l'accessibilité, sans le
              répéter visuellement. */}
          <h1 className="sr-only">Pokédex</h1>
          <PokemonGrid
            pokemonList={pokemonWithTypes}
            types={types}
            typeMap={typeMap}
          />
        </main>
      </div>
    </ViewTransition>
  );
}
