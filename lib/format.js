// Fonctions pures de formatage : pas de React, pas d'API navigateur.
import nomsFr from "./data/noms-fr.json";

const formateurFrancais = new Intl.NumberFormat("fr-FR");

// Formate une mesure avec une virgule décimale française.
// ex. formatMeasure(1.5, "m") -> "1,5 m"
export function formatMeasure(value, unit) {
  return `${formateurFrancais.format(value)} ${unit}`;
}

// Renvoie les Pokémon voisins (précédent/suivant) d'un id, avec leur nom
// français précalculé (lib/data/noms-fr.json), sans appel réseau.
// prev vaut null si id <= 1, next vaut null si id >= 1025.
export function getPokemonNeighbors(id) {
  const prevId = id - 1;
  const nextId = id + 1;

  return {
    prev:
      prevId >= 1
        ? {
            id: prevId,
            number: String(prevId).padStart(3, "0"),
            name: nomsFr[String(prevId)],
          }
        : null,
    next:
      nextId <= 1025
        ? {
            id: nextId,
            number: String(nextId).padStart(3, "0"),
            name: nomsFr[String(nextId)],
          }
        : null,
  };
}
