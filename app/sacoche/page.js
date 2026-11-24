import { ViewTransition } from "react";
import { getPokemonList, getTypes, getTypeMap } from "@/lib/pokeapi";
import TeamView from "@/components/TeamView";

// Page de la sacoche : on recharge la liste des Pokémon côté serveur (mise
// en cache), et TeamView (côté client) affiche les 6 emplacements selon la
// sacoche stockée dans le navigateur (titre et compteur compris).
export default async function SacochePage() {
  const [pokemonList, types, typeMap] = await Promise.all([
    getPokemonList(),
    getTypes(),
    getTypeMap(),
  ]);

  const pokemonWithTypes = pokemonList.map((pokemon) => ({
    ...pokemon,
    types: types.filter((type) => typeMap[type].includes(pokemon.id)),
  }));

  return (
    <ViewTransition enter="slide-up" default="none">
      <div className="min-h-screen bg-background px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-10">
        <main id="main-content" className="mx-auto max-w-7xl">
          <TeamView pokemonList={pokemonWithTypes} />
        </main>
      </div>
    </ViewTransition>
  );
}
