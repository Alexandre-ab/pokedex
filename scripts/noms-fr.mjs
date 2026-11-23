// Script à lancer une seule fois (node scripts/noms-fr.mjs) : récupère le
// nom français de chaque Pokémon (id 1 à 1025) depuis la PokéAPI, et écrit
// le résultat dans lib/data/noms-fr.json. Ce fichier est ensuite lu
// directement par lib/pokeapi.js (plus besoin de refaire ces appels).

const PREMIER_ID = 1;
const DERNIER_ID = 1025;
const TAILLE_LOT = 25;
const MAX_ESSAIS = 3;

async function getNomFrancais(id) {
  for (let essai = 1; essai <= MAX_ESSAIS; essai++) {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const nomFr = data.names.find((entry) => entry.language.name === "fr");
      return nomFr ? nomFr.name : data.name;
    } catch (error) {
      if (essai === MAX_ESSAIS) {
        console.error(`Échec pour l'id ${id} après ${MAX_ESSAIS} essais :`, error.message);
        return null;
      }
    }
  }
}

async function main() {
  const noms = {};

  for (let debut = PREMIER_ID; debut <= DERNIER_ID; debut += TAILLE_LOT) {
    const fin = Math.min(debut + TAILLE_LOT - 1, DERNIER_ID);
    const ids = [];
    for (let id = debut; id <= fin; id++) {
      ids.push(id);
    }

    // Un lot de TAILLE_LOT appels en parallèle, puis on passe au lot suivant.
    const resultats = await Promise.all(ids.map((id) => getNomFrancais(id)));

    ids.forEach((id, index) => {
      if (resultats[index]) {
        noms[id] = resultats[index];
      }
    });

    console.log(`Lot ${debut}-${fin} terminé (${Object.keys(noms).length}/${DERNIER_ID} noms récupérés)`);
  }

  const fs = await import("node:fs/promises");
  await fs.writeFile(
    new URL("../lib/data/noms-fr.json", import.meta.url),
    JSON.stringify(noms, null, 2) + "\n"
  );

  console.log(`Terminé : ${Object.keys(noms).length} noms écrits dans lib/data/noms-fr.json`);
}

main();
