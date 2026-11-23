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
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Mes favoris
        </h1>
        <FavoritesList pokemonList={pokemonWithTypes} />
      </main>
    </div>
  );
}
