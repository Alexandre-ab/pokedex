import { getPokemonList } from "@/lib/pokeapi";
import PokemonGrid from "@/components/PokemonGrid";

// Page d'accueil : la grille des 1 025 Pokémon, avec recherche.
export default async function Home() {
  const pokemonList = await getPokemonList();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pokédex
        </h1>
        <PokemonGrid pokemonList={pokemonList} />
      </main>
    </div>
  );
}
