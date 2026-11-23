// Récupère la liste des 1 025 Pokémon avec un seul appel à la PokéAPI.
// On ne garde pas les formes spéciales (id > 1025), et on construit l'image
// à partir de l'id, sans refaire un appel par Pokémon.

const BASE_IMAGE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export async function getPokemonList() {
  "use cache";

  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await response.json();

  return data.results
    .map((entry) => {
      // L'url ressemble à ".../pokemon/25/" : on récupère le nombre avant le dernier "/".
      const id = Number(entry.url.split("/").filter(Boolean).pop());
      return {
        id,
        name: entry.name,
        image: `${BASE_IMAGE_URL}/${id}.png`,
      };
    })
    .filter((pokemon) => pokemon.id >= 1 && pokemon.id <= 1025);
}
