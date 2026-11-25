// Données pures de la vitrine « Lentille » (page d'accueil).
// Pas de React, pas d'appel réseau : seulement des constantes et des
// petites fonctions faciles à tester.

// Les 4 spécimens du hero, dans l'ordre d'affichage. Ils sont choisis pour
// leur variante chromatique très différente de la normale (Dracaufeu noir,
// Léviator rouge, Noctali aux anneaux bleus, Rayquaza noir).
// L'ordre est FIXE : pas de tirage au hasard au rendu (Math.random()
// rendrait la page dynamique avec `cacheComponents: true`).
export const SPECIMENS_VITRINE = [6, 130, 197, 384];

const BASE_ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

// Illustration officielle normale : même URL que les cartes du catalogue.
export function illustrationNormale(id) {
  return `${BASE_ARTWORK}/${id}.png`;
}

// Illustration officielle chromatique (« shiny ») : même pose et même
// cadrage, au pixel près, que l'illustration normale.
export function illustrationChromatique(id) {
  return `${BASE_ARTWORK}/shiny/${id}.png`;
}

// Numéro sur 4 chiffres : 6 -> "0006".
export function numeroSurQuatre(id) {
  return String(id).padStart(4, "0");
}

// Sépare les milliers avec une espace fine insécable, comme en français :
// 1025 -> "1 025". Écrit à la main (et non avec toLocaleString) pour que le
// serveur et le navigateur produisent exactement le même texte.
export function separerMilliers(nombre) {
  return String(nombre).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ---------------------------------------------------------------------------
// Les 9 générations du Pokédex national, dans l'ordre chronologique.
// C'est la SEULE source de ces plages : la frise de l'accueil et la fiche
// détaillée (champ « Génération ») l'utilisent toutes les deux.
// - debut / fin : premier et dernier numéro national de la génération ;
// - starters : les 3 Pokémon de départ de la région (plante, feu, eau).
// ---------------------------------------------------------------------------
export const GENERATIONS = [
  { numero: "I", region: "Kanto", debut: 1, fin: 151, starters: [1, 4, 7] },
  { numero: "II", region: "Johto", debut: 152, fin: 251, starters: [152, 155, 158] },
  { numero: "III", region: "Hoenn", debut: 252, fin: 386, starters: [252, 255, 258] },
  { numero: "IV", region: "Sinnoh", debut: 387, fin: 493, starters: [387, 390, 393] },
  { numero: "V", region: "Unys", debut: 494, fin: 649, starters: [495, 498, 501] },
  { numero: "VI", region: "Kalos", debut: 650, fin: 721, starters: [650, 653, 656] },
  { numero: "VII", region: "Alola", debut: 722, fin: 809, starters: [722, 725, 728] },
  { numero: "VIII", region: "Galar", debut: 810, fin: 905, starters: [810, 813, 816] },
  { numero: "IX", region: "Paldea", debut: 906, fin: 1025, starters: [906, 909, 912] },
];

// Nombre d'espèces d'une génération : Kanto (1 à 151) -> 151.
export function especesGeneration(generation) {
  return generation.fin - generation.debut + 1;
}

// Génération d'un Pokémon à partir de son numéro national (1 à 1025).
// Au-delà de 1025 (cas qui ne devrait pas arriver), on renvoie la dernière.
export function trouverGeneration(id) {
  return GENERATIONS.find((generation) => id <= generation.fin) ?? GENERATIONS.at(-1);
}

// ---------------------------------------------------------------------------
// Nuancier des types : nom de l'événement envoyé quand on clique sur un type
// de la vitrine. PokemonGrid l'écoute et pré-sélectionne ce type. Un simple
// événement du navigateur (et non un état partagé ou un paramètre d'URL) :
// app/page.js reste un Server Component 100 % statique.
// ---------------------------------------------------------------------------
export const EVENEMENT_CHOIX_TYPE = "pokedex:select-type";

// Compte les Pokémon de chaque type et trie du plus fréquent au plus rare
// (à égalité, ordre alphabétique de l'identifiant, pour un rendu stable).
// typeMap : { fire: [4, 5, 6, ...], ... } -> [{ type: "water", nombre: 158 }, ...]
export function compterTypes(types, typeMap) {
  return types
    .map((type) => ({ type, nombre: typeMap[type]?.length ?? 0 }))
    .sort((a, b) => b.nombre - a.nombre || a.type.localeCompare(b.type));
}

// ---------------------------------------------------------------------------
// Panthéon des records. Chaque valeur AFFICHÉE est recalculée à partir de la
// fiche PokéAPI (getPokemonDetail) : rien n'est écrit en dur.
// Vérifié le 25/11/2026 sur les 1 025 Pokémon (ids 1 à 1025) de PokéAPI :
//   PV max 255 (#242), Vitesse max 200 (#894), Défense max 230 (#213),
//   taille max 200 dm = 20 m (#890), poids max 9999 hg = 999,9 kg (#790 et
//   #797 ex æquo : le plus petit numéro l'emporte), total max 720 (#493).
// mesure : nom de la stat PokéAPI, ou "height", "weight", "total".
// ---------------------------------------------------------------------------
export const RECORDS_VITRINE = [
  { id: 242, mesure: "hp", titre: "Le plus de PV" },
  { id: 894, mesure: "speed", titre: "Le plus rapide" },
  { id: 213, mesure: "defense", titre: "La meilleure Défense" },
  { id: 890, mesure: "height", titre: "Le plus grand" },
  { id: 790, mesure: "weight", titre: "Le plus lourd", exAequo: [797] },
  { id: 493, mesure: "total", titre: "Le plus haut total de stats" },
];

// Valeur d'un record lue dans une fiche de getPokemonDetail
// (taille en m, poids en kg, stats de base).
export function valeurRecord(fiche, mesure) {
  if (mesure === "height") return fiche.height;
  if (mesure === "weight") return fiche.weight;
  if (mesure === "total") return fiche.stats.reduce((total, stat) => total + stat.value, 0);
  return fiche.stats.find((stat) => stat.name === mesure)?.value ?? 0;
}

// Texte d'un record : nombre avec virgule décimale française + unité.
// (999.9, "weight") -> { nombre: "999,9", unite: "kg" }
export function formaterRecord(valeur, mesure) {
  const unites = { height: "m", weight: "kg" };
  return { nombre: String(valeur).replace(".", ","), unite: unites[mesure] ?? "" };
}
