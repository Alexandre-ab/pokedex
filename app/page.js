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
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Pokédex
        </h1>
        <PokemonGrid
          pokemonList={pokemonWithTypes}
          types={types}
          typeMap={typeMap}
        />
      </main>
    </div>
  );
}
