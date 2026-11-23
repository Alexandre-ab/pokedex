// Filtre une liste de Pokémon par nom ou par numéro.
// Fonction pure : pas de React, pas d'API navigateur, facile à tester seule.
export function searchPokemon(list, texte) {
  const query = texte.trim().toLowerCase();

  if (query === "") {
    return list;
  }

  // On retire un éventuel "#" au début pour détecter une recherche par numéro.
  const sansDiese = query.startsWith("#") ? query.slice(1) : query;
  const estUnNumero = /^\d+$/.test(sansDiese);

  if (estUnNumero) {
    const numero = Number(sansDiese);
    return list.filter((pokemon) => pokemon.id === numero);
  }

  return list.filter((pokemon) => pokemon.name.toLowerCase().includes(query));
}

// Garde uniquement les Pokémon qui ont le type demandé, grâce à typeMap
// (typeMap[type] est un tableau d'id). Sans type choisi, renvoie list tel quel.
export function filterByType(list, typeMap, type) {
  if (!type) {
    return list;
  }

  const idsDuType = typeMap[type] ?? [];
  return list.filter((pokemon) => idsDuType.includes(pokemon.id));
}
