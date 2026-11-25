import { ViewTransition } from "react";
import {
  getPokemonDetail,
  getPokemonList,
  getTypes,
  getTypeMap,
} from "@/lib/pokeapi";
import {
  GENERATIONS,
  RECORDS_VITRINE,
  SPECIMENS_VITRINE,
  compterTypes,
  especesGeneration,
  formaterRecord,
  separerMilliers,
  valeurRecord,
} from "@/lib/vitrine";
import HeroLentille from "@/components/HeroLentille";
import SmoothScroll from "@/components/SmoothScroll";
import VitrineManifeste from "@/components/VitrineManifeste";
import VitrineNuancierTypes from "@/components/VitrineNuancierTypes";
import VitrineFriseGenerations from "@/components/VitrineFriseGenerations";
import VitrineRecords from "@/components/VitrineRecords";
import TitreVitrine from "@/components/TitreVitrine";
import PokemonGrid from "@/components/PokemonGrid";

// Page d'accueil : la vitrine « Lentille » en haut (hero plein écran,
// manifeste, nuancier des types, frise des générations, panthéon des
// records), puis le catalogue complet des Pokémon
// (#catalogue) avec sa recherche et son filtre par type, inchangé.
export default async function Home() {
  // Les appels sont indépendants : on les lance en parallèle. Tous sont mis
  // en cache ('use cache' dans lib/pokeapi.js) : la page reste statique.
  const [pokemonList, types, typeMap, fichesVitrine, fichesRecords] = await Promise.all([
    getPokemonList(),
    getTypes(),
    getTypeMap(),
    // Les 4 spécimens du hero : nom français et types dans le bon ordre
    // (le type principal colore l'aura).
    Promise.all(SPECIMENS_VITRINE.map((id) => getPokemonDetail(id))),
    // Les 6 fiches du panthéon des records (valeurs lues dans les données).
    Promise.all(RECORDS_VITRINE.map((record) => getPokemonDetail(record.id))),
  ]);

  // On attache à chaque Pokémon ses types, à partir de typeMap
  // (déjà chargé en mémoire : pas de nouvel appel réseau).
  const pokemonWithTypes = pokemonList.map((pokemon) => ({
    ...pokemon,
    types: types.filter((type) => typeMap[type].includes(pokemon.id)),
  }));

  // On ne passe au composant client que le strict nécessaire.
  const specimens = fichesVitrine.map((fiche) => ({
    id: fiche.id,
    nom: fiche.name,
    types: fiche.types,
  }));

  // Frise des 9 générations : plages de lib/vitrine.js + noms français des
  // starters, pris dans la liste déjà chargée (aucun appel réseau en plus).
  const nomsParId = new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon.nameFr]));
  const generations = GENERATIONS.map((generation) => ({
    numero: generation.numero,
    region: generation.region,
    debut: generation.debut,
    fin: generation.fin,
    especes: especesGeneration(generation),
    starters: generation.starters.map((id) => ({ id, nom: nomsParId.get(id) ?? `#${id}` })),
  }));

  // Nuancier : nombre de Pokémon de chaque type, du plus fréquent au plus
  // rare (calculé depuis typeMap, déjà en mémoire).
  const comptesTypes = compterTypes(types, typeMap);

  // Panthéon : chaque valeur est recalculée depuis la fiche PokéAPI.
  const records = RECORDS_VITRINE.map((record, index) => {
    const fiche = fichesRecords[index];
    const { nombre, unite } = formaterRecord(valeurRecord(fiche, record.mesure), record.mesure);
    return {
      id: record.id,
      titre: record.titre,
      nom: fiche.name,
      types: fiche.types,
      nombre,
      unite,
      exAequo: (record.exAequo ?? []).map((id) => ({ id, nom: nomsParId.get(id) ?? `#${id}` })),
    };
  });

  return (
    <ViewTransition enter="slide-up" default="none">
      <main id="main-content" className="flex-1 bg-background">
        {/* Défilement doux (Lenis), sur cette page seulement. N'affiche rien. */}
        <SmoothScroll />

        {/* Vitrine : le hero « Lentille » (effet lourd autorisé ici). */}
        <HeroLentille specimens={specimens} total={pokemonList.length} />

        {/* Manifeste (nuit) : chiffres réels, tirés des données. */}
        <VitrineManifeste
          total={pokemonList.length}
          nombreTypes={types.length}
          nombreGenerations={GENERATIONS.length}
        />

        {/* Nuancier des 18 types (suite de la nuit) : un clic pré-filtre
            le catalogue sur ce type. */}
        <VitrineNuancierTypes comptes={comptesTypes} />

        {/* Frise des 9 générations (papier, épinglée sur desktop). */}
        <VitrineFriseGenerations generations={generations} />

        {/* Panthéon des records (abysse). */}
        <VitrineRecords records={records} total={pokemonList.length} />

        {/* Catalogue complet. scroll-mt : marge en haut quand on arrive par
            l'ancre #catalogue (bouton du hero, lien « Index »). */}
        <section
          id="catalogue"
          aria-labelledby="titre-catalogue"
          className="scroll-mt-4 px-4 pt-6 pb-10 sm:px-6 lg:px-10 lg:pt-10"
        >
          <div className="mx-auto max-w-7xl">
            {/* En-tête : même voix éditoriale que les sections de la vitrine
                (titre-section + un mot-clé en Fraunces italique), puis une
                phrase d'accueil. */}
            <header className="pb-2">
              {/* tabIndex -1 : le nuancier y place le focus après un choix de
                  type (focus programmatique seulement, hors tabulation). */}
              <TitreVitrine
                id="titre-catalogue"
                tabIndex={-1}
                surtitre="Catalogue"
                debut="Explorer les"
                motCle={`${separerMilliers(pokemonList.length)} espèces`}
                fin=""
                titreClassName="max-w-[18ch] rounded-lg text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              />
              <p className="mt-2 max-w-xl text-base text-muted-foreground">
                Les {pokemonList.length} Pokémon à portée de main : cherche un
                nom ou un numéro, ou filtre par type.
              </p>
            </header>

            {/* Barre de recherche + grille. */}
            <section aria-label="Liste des Pokémon" className="mt-4">
              <PokemonGrid
                pokemonList={pokemonWithTypes}
                types={types}
                typeMap={typeMap}
              />
            </section>
          </div>
        </section>
      </main>
    </ViewTransition>
  );
}
