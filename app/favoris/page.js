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
    <div className="min-h-screen bg-background px-4 py-8">
      <main id="main-content" className="mx-auto max-w-6xl">
        <h1 className="font-heading mb-6 text-center text-3xl font-bold text-foreground">
          Mes favoris
        </h1>
        <FavoritesList pokemonList={pokemonWithTypes} />
      </main>
    </div>
  );
}
