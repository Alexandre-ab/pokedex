// Retire les accents et met en minuscules, pour comparer du texte sans se
// soucier de la casse ni des accents (ex. "pikachu" === "Pikachu" === "PIKACHU").
function normaliser(texte) {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Filtre une liste de Pokémon par nom (anglais "name" et/ou français
// "nameFr", si présent) ou par numéro. Fonction pure : pas de React, pas
// d'API navigateur, facile à tester seule.
export function searchPokemon(list, texte) {
  const query = normaliser(texte.trim());

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

  return list.filter((pokemon) => {
    const correspondAuNomAnglais = normaliser(pokemon.name).includes(query);
    // pokemon.nameFr peut être absent (anciens objets, tests) : on ne
    // cherche dedans que s'il existe.
    const correspondAuNomFrancais = pokemon.nameFr
      ? normaliser(pokemon.nameFr).includes(query)
      : false;

    return correspondAuNomAnglais || correspondAuNomFrancais;
  });
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
