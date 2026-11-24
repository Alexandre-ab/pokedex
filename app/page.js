import { ViewTransition } from "react";
import { getPokemonList, getTypes, getTypeMap } from "@/lib/pokeapi";
import PokemonGrid from "@/components/PokemonGrid";

// Page d'accueil : un en-tête sobre (titre + sous-titre) puis la grille des
// Pokémon avec sa barre de recherche et son filtre par type.
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
      <div className="min-h-screen bg-background px-4 pt-6 pb-10 sm:px-6 lg:px-10 lg:pt-10">
        <main id="main-content" className="mx-auto max-w-7xl">
          {/* En-tête : titre clair et une phrase d'accueil. */}
          <header className="pb-2">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Pokédex
            </h1>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">
              Les {pokemonList.length} Pokémon à portée de main : cherche un nom
              ou un numéro, ou filtre par type.
            </p>
          </header>

          {/* Barre de recherche + grille. */}
          <section aria-label="Liste des Pokémon" className="mt-4">
            <PokemonGrid
              pokemonList={pokemonWithTypes}
              types={types}
              typeMap={typeMap}
            />
          </section>
        </main>
      </div>
    </ViewTransition>
  );
}
