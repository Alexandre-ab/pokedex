import { getPokemonList, getTypes, getTypeMap } from "@/lib/pokeapi";
import TeamView from "@/components/TeamView";

// Page de la sacoche : on recharge la liste des Pokémon côté serveur (mise
// en cache), et TeamView (côté client) affiche les 6 emplacements selon la
// sacoche stockée dans le navigateur.
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
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Ma sacoche
        </h1>
        <TeamView pokemonList={pokemonWithTypes} />
      </main>
    </div>
  );
}
