import { ViewTransition } from "react";
import { getPokemonList, getTypes, getTypeMap } from "@/lib/pokeapi";
import FavoritesList from "@/components/FavoritesList";

// Page des favoris : on recharge la liste des Pokémon côté serveur (mise en
// cache par getPokemonList/getTypes/getTypeMap), et c'est FavoritesList (côté
// client) qui filtre selon les favoris stockés dans le navigateur.
export default async function FavorisPage() {
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
      <div className="flex-1 bg-background px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-10">
        <main id="main-content" className="mx-auto max-w-7xl">
          <FavoritesList pokemonList={pokemonWithTypes} />
        </main>
      </div>
    </ViewTransition>
  );
}
