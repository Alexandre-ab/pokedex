import { getPokemonList } from "@/lib/pokeapi";
import PokemonCard from "@/components/PokemonCard";

// Page d'accueil : la grille des 1 025 Pokémon.
export default async function Home() {
  const pokemonList = await getPokemonList();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pokédex
        </h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      </main>
    </div>
  );
}
