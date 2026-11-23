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
    <div className="min-h-screen bg-background px-4 py-8">
      <main id="main-content" className="mx-auto max-w-3xl">
        <h1 className="font-heading mb-6 text-center text-3xl font-bold text-foreground">
          Ma sacoche
        </h1>
        <TeamView pokemonList={pokemonWithTypes} />
      </main>
    </div>
  );
}
