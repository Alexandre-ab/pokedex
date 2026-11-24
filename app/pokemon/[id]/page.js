import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parsePokemonId, getPokemonDetail, getPokemonList } from "@/lib/pokeapi";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { formatMeasure, getPokemonNeighbors } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";
import HoloReveal from "@/components/HoloReveal";
import StatBars from "@/components/StatBars";
import PokemonDetailSkeleton from "@/components/PokemonDetailSkeleton";
import PokemonKeyboardNav from "@/components/PokemonKeyboardNav";

// Générations : dernier numéro de chaque génération et sa région d'origine.
// Valeurs fixes (elles ne changent qu'avec une nouvelle génération), ce qui
// évite un appel réseau de plus juste pour cette information.
const GENERATIONS = [
  { fin: 151, numero: "I", region: "Kanto" },
  { fin: 251, numero: "II", region: "Johto" },
  { fin: 386, numero: "III", region: "Hoenn" },
  { fin: 493, numero: "IV", region: "Sinnoh" },
  { fin: 649, numero: "V", region: "Unys" },
  { fin: 721, numero: "VI", region: "Kalos" },
  { fin: 809, numero: "VII", region: "Alola" },
  { fin: 905, numero: "VIII", region: "Galar" },
  { fin: 1025, numero: "IX", region: "Paldea" },
];

// Génération d'un Pokémon à partir de son numéro (1 à 1025).
function trouverGeneration(id) {
  return GENERATIONS.find((generation) => id <= generation.fin) ?? GENERATIONS.at(-1);
}

// Numéro sur 4 chiffres : 25 -> "0025" (comme sur les cartes).
function numeroArchive(id) {
  return String(id).padStart(4, "0");
}

// Transition directionnelle de la carte : vient-on du bouton / de la
// flèche Suivant (nav-forward) ou Précédent (nav-back) ? Sans type
// (navigation directe ou retour navigateur), pas d'animation directionnelle.
// Le <ViewTransition> est placé sur la carte principale (key = id) : changer de
// Pokémon la remplace, et c'est elle qui glisse (un seul mouvement, pas deux).
function CardTransition({ id, children }) {
  const directions = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };
  return (
    <ViewTransition key={id} enter={directions} exit={directions} update={directions} default="none">
      {children}
    </ViewTransition>
  );
}

// La page elle-même ne lit pas "params" directement : ça la rendrait
// dynamique pour tout le monde. On passe la promesse au composant enfant,
// dans un <Suspense>, pour que le reste de la route reste prérendable.
export default function PokemonPage({ params }) {
  return (
    <Suspense
      fallback={
        <ViewTransition exit="slide-down">
          <PokemonDetailSkeleton />
        </ViewTransition>
      }
    >
      <ViewTransition enter="slide-up" default="none">
        <PokemonDetail paramsPromise={params} />
      </ViewTransition>
    </Suspense>
  );
}

// Fiche détaillée (design ergonomique doux) : une grande carte arrondie à
// deux colonnes.
//   - À gauche : l'illustration sur un fond doux teinté au type principal,
//     avec un halo lumineux (HoloReveal) et la navigation Précédent / Suivant.
//   - À droite : nom, types, description, mensurations en tuiles, boutons
//     Favori / Sacoche, puis les statistiques de base.
async function PokemonDetail({ paramsPromise }) {
  const { id: rawId } = await paramsPromise;
  const id = parsePokemonId(rawId);

  if (id === null) {
    notFound();
  }

  // getPokemonList est déjà en cache ('use cache') : on s'en sert seulement
  // pour retrouver le nom d'origine (anglais) du Pokémon.
  const [pokemon, pokemonList] = await Promise.all([
    getPokemonDetail(id),
    getPokemonList(),
  ]);

  const numero = numeroArchive(pokemon.id);
  const premierType = pokemon.types[0] ?? "normal";
  const couleurType = `var(--type-${premierType})`;
  const generation = trouverGeneration(pokemon.id);
  const { prev, next } = getPokemonNeighbors(pokemon.id);

  // Nom d'origine, affiché seulement s'il diffère du nom français
  // (ex. "Bulbizarre" / "bulbasaur", mais pas "Pikachu" / "pikachu").
  const nomOrigine = pokemonList.find((entry) => entry.id === pokemon.id)?.name;
  const afficherNomOrigine =
    nomOrigine && nomOrigine.toLowerCase() !== pokemon.name.toLowerCase();

  // Mensurations : une tuile par information.
  const mensurations = [
    { label: "Taille", valeur: formatMeasure(pokemon.height, "m") },
    { label: "Poids", valeur: formatMeasure(pokemon.weight, "kg") },
    { label: "Génération", valeur: `${generation.numero} · ${generation.region}` },
  ];

  // Style commun des liens Précédent / Suivant (cible min-h-11).
  const styleLienVoisin =
    "group flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-card/80 px-3 py-2 text-sm shadow-soft ring-1 ring-border hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const styleTouche =
    "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-muted px-1 font-mono text-xs text-muted-foreground";

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-8">
      <main id="main-content" className="mx-auto max-w-6xl">
        {/* Flèches ← / → du clavier pour changer de Pokémon. */}
        <PokemonKeyboardNav prevId={prev?.id ?? null} nextId={next?.id ?? null} />

        {/* Retour à l'index + position dans le catalogue. */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Retour à l&apos;index
          </Link>
          <span className="text-index text-muted-foreground">
            #{numero} <span className="hidden sm:inline">/ 1025</span>
          </span>
        </div>

        {/* Pas de fondu/zoom ici : l'entrée de la carte est gérée par
            <ViewTransition> (une seule animation, pas deux superposées). */}
        <CardTransition id={pokemon.id}>
          <article
            aria-labelledby="nom-pokemon"
            className="mt-3 grid gap-2 rounded-3xl bg-card p-2 shadow-soft ring-1 ring-border lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            {/* ================= Colonne de gauche : le visuel ================= */}
            <section aria-label="Illustration" className="flex flex-col gap-2">
              <div
                className="relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-2xl sm:aspect-[5/4] lg:aspect-auto lg:min-h-[28rem]"
                style={{
                  backgroundColor: `color-mix(in oklch, ${couleurType} 14%, var(--card))`,
                }}
              >
                <HoloReveal glowType={premierType}>
                  {/* Élément partagé : la même image que sur la carte de la
                      grille (même "name"), pour qu'elle glisse jusqu'ici. */}
                  <ViewTransition name={`pokemon-image-${pokemon.id}`} share="pokemon-image-morph">
                    <Image
                      src={pokemon.image}
                      alt={pokemon.name}
                      width={320}
                      height={320}
                      className="h-56 w-56 object-contain drop-shadow-lg sm:h-64 sm:w-64 lg:h-80 lg:w-80"
                      priority
                    />
                  </ViewTransition>
                </HoloReveal>
              </div>

              {/* Précédent / Suivant : deux gros boutons confortables. */}
              <nav aria-label="Pokémon voisins" className="flex gap-2">
                {prev ? (
                  <Link
                    href={`/pokemon/${prev.id}`}
                    transitionTypes={["nav-back"]}
                    className={styleLienVoisin}
                  >
                    <kbd aria-hidden="true" className={styleTouche}>←</kbd>
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-xs text-muted-foreground">Précédent</span>
                      <span className="truncate font-medium">{prev.name}</span>
                    </span>
                  </Link>
                ) : (
                  <span className="flex min-h-11 flex-1 items-center rounded-xl px-3 text-sm text-muted-foreground">
                    Premier Pokémon
                  </span>
                )}
                {next ? (
                  <Link
                    href={`/pokemon/${next.id}`}
                    transitionTypes={["nav-forward"]}
                    className={`${styleLienVoisin} justify-end text-right`}
                  >
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-xs text-muted-foreground">Suivant</span>
                      <span className="truncate font-medium">{next.name}</span>
                    </span>
                    <kbd aria-hidden="true" className={styleTouche}>→</kbd>
                  </Link>
                ) : (
                  <span className="flex min-h-11 flex-1 items-center justify-end rounded-xl px-3 text-sm text-muted-foreground">
                    Dernier Pokémon
                  </span>
                )}
              </nav>
            </section>

            {/* ================= Colonne de droite : les informations ================= */}
            <section aria-label="Informations" className="flex flex-col p-4 sm:p-6">
              <p className="text-index text-muted-foreground">#{numero}</p>

              <h1
                id="nom-pokemon"
                className="mt-1 font-heading text-4xl leading-tight font-bold tracking-tight break-words text-foreground sm:text-5xl"
              >
                {pokemon.name}
              </h1>
              {afficherNomOrigine && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Nom d&apos;origine : <span className="text-foreground">{nomOrigine}</span>
                </p>
              )}

              {/* Types : pastilles arrondies, couleurs du thème (contraste garanti). */}
              <ul aria-label="Types" className="mt-4 flex flex-wrap gap-2">
                {pokemon.types.map((type) => (
                  <li key={type}>
                    <Badge
                      className={`h-7 rounded-full px-3 text-sm font-medium ${
                        TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"
                      }`}
                    >
                      {TYPE_STYLES[type]?.label ?? type}
                    </Badge>
                  </li>
                ))}
              </ul>

              {/* Description du Pokédex, lisible. */}
              {pokemon.description && (
                <p className="mt-5 max-w-prose text-base leading-relaxed text-muted-foreground">
                  {pokemon.description}
                </p>
              )}

              {/* Mensurations : tuiles douces. */}
              <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {mensurations.map(({ label, valeur }) => (
                  <div key={label} className="rounded-2xl bg-muted px-4 py-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-base font-semibold text-foreground">{valeur}</dd>
                  </div>
                ))}
              </dl>

              {/* Actions : favori et sacoche. */}
              <div className="mt-5 flex flex-wrap gap-2">
                <FavoriteButton id={pokemon.id} showLabel />
                <TeamButton id={pokemon.id} showLabel />
              </div>

              {/* Statistiques de base. */}
              <StatBars stats={pokemon.stats} color={premierType} />
            </section>
          </article>
        </CardTransition>
      </main>
    </div>
  );
}
