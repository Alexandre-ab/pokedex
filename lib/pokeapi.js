// Récupère la liste des 1 025 Pokémon avec un seul appel à la PokéAPI.
// On ne garde pas les formes spéciales (id > 1025), et on construit l'image
// à partir de l'id, sans refaire un appel par Pokémon.

import nomsFr from "./data/noms-fr.json";

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
        // Nom français précalculé (scripts/noms-fr.mjs -> lib/data/noms-fr.json).
        // "name" reste tel quel (anglais) pour ne pas casser les tests existants.
        nameFr: nomsFr[id] ?? entry.name,
        image: `${BASE_IMAGE_URL}/${id}.png`,
      };
    })
    .filter((pokemon) => pokemon.id >= 1 && pokemon.id <= 1025);
}

// Types qui existent dans l'API mais ne sont pas des types "jouables"
// (utilisés pour des cas spéciaux comme certaines formes de Pokémon).
const TYPES_A_EXCLURE = ["unknown", "shadow", "stellar"];

// Renvoie les 18 noms de types jouables (feu, eau, plante, etc.).
export async function getTypes() {
  "use cache";

  const response = await fetch("https://pokeapi.co/api/v2/type");
  const data = await response.json();

  return data.results
    .map((entry) => entry.name)
    .filter((name) => !TYPES_A_EXCLURE.includes(name));
}

// Pour chaque type, renvoie la liste des id de Pokémon (1 à 1025) qui l'ont.
// Résultat : { fire: [4, 5, 6, ...], water: [7, 8, 9, ...], ... }
export async function getTypeMap() {
  "use cache";

  const types = await getTypes();

  // Un appel par type, tous lancés en parallèle.
  const reponses = await Promise.all(
    types.map((type) =>
      fetch(`https://pokeapi.co/api/v2/type/${type}`).then((res) => res.json())
    )
  );

  const typeMap = {};

  types.forEach((type, index) => {
    const pokemonDuType = reponses[index].pokemon
      .map((entry) => Number(entry.pokemon.url.split("/").filter(Boolean).pop()))
      .filter((id) => id >= 1 && id <= 1025);

    typeMap[type] = pokemonDuType;
  });

  return typeMap;
}

// Vérifie qu'un id de Pokémon reçu depuis l'URL est bien un entier entre 1 et 1025.
// Fonction pure : pas d'appel réseau, utile pour valider /pokemon/[id].
export function parsePokemonId(rawId) {
  const texte = String(rawId);

  if (!/^\d+$/.test(texte)) {
    return null;
  }

  const id = Number(texte);
  return id >= 1 && id <= 1025 ? id : null;
}

// Récupère la fiche détaillée d'un Pokémon : infos de base + espèce (pour le
// nom et la description en français).
export async function getPokemonDetail(id) {
  "use cache";

  const [pokemon, species] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
      res.json()
    ),
  ]);

  const nomFrancais = species.names.find(
    (entry) => entry.language.name === "fr"
  );

  const descriptionFrancaise = species.flavor_text_entries.find(
    (entry) => entry.language.name === "fr"
  );

  return {
    id,
    name: nomFrancais ? nomFrancais.name : pokemon.name,
    image: `${BASE_IMAGE_URL}/${id}.png`,
    types: pokemon.types.map((entry) => entry.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    stats: pokemon.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    // Les descriptions de la PokéAPI contiennent des retours à la ligne et
    // des "\f" (saut de page) : on les remplace par des espaces.
    description: descriptionFrancaise
      ? descriptionFrancaise.flavor_text.replace(/[\n\f]/g, " ")
      : "",
  };
}
