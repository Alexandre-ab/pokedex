import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { parsePokemonId, getPokemonDetail } from "@/lib/pokeapi";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { formatMeasure, getPokemonNeighbors } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";
import HoloReveal from "@/components/HoloReveal";
import StatBars from "@/components/StatBars";
import PokemonDetailSkeleton from "@/components/PokemonDetailSkeleton";
import PokemonKeyboardNav from "@/components/PokemonKeyboardNav";

// Transition directionnelle de la carte : vient-on du bouton / de la flèche
// Suivant (nav-forward) ou Précédent (nav-back) ? Sans type (navigation
// directe ou retour navigateur), pas d'animation directionnelle.
// Le <ViewTransition> est placé sur la carte (key = id) : changer de Pokémon
// la remplace, et c'est elle qui glisse (un seul mouvement, pas deux).
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

async function PokemonDetail({ paramsPromise }) {
  const { id: rawId } = await paramsPromise;
  const id = parsePokemonId(rawId);

  if (id === null) {
    notFound();
  }

  const pokemon = await getPokemonDetail(id);
  const number = String(pokemon.id).padStart(3, "0");
  const premierType = pokemon.types[0];
  const { prev, next } = getPokemonNeighbors(pokemon.id);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main id="main-content" className="mx-auto max-w-4xl">
        {/* Flèches ← / → du clavier pour changer de Pokémon. */}
        <PokemonKeyboardNav prevId={prev?.id ?? null} nextId={next?.id ?? null} />
        <Button
          variant="ghost"
          render={<Link href="/" transitionTypes={["nav-back"]} />}
          nativeButton={false}
          className="mb-6"
        >
          <ArrowLeft data-icon="inline-start" />
          Retour au Pokédex
        </Button>

        {/* Pas de fondu/zoom ici : l'entrée de la fiche est gérée par
            <ViewTransition> (une seule animation, pas deux superposées). */}
        <CardTransition id={pokemon.id}>
          <Card className="p-6">
            {/* 1 colonne sur mobile, 2 colonnes à partir de lg : l'illustration
                à gauche (sur son halo), les informations à droite. */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="flex items-center justify-center">
                <HoloReveal glowType={premierType}>
                  {/* Élément partagé : la même image que sur la carte de la
                      grille (même "name"), pour qu'elle glisse jusqu'ici. */}
                  <ViewTransition name={`pokemon-image-${pokemon.id}`} share="pokemon-image-morph">
                    <Image
                      src={pokemon.image}
                      alt={pokemon.name}
                      width={280}
                      height={280}
                      className="h-56 w-56 object-contain lg:h-64 lg:w-64"
                      priority
                    />
                  </ViewTransition>
                </HoloReveal>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-sm text-muted-foreground">#{number}</p>
                <h1 className="font-heading text-3xl font-bold capitalize text-foreground">
                  {pokemon.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-1 lg:justify-start">
                  {pokemon.types.map((type) => (
                    <Badge
                      key={type}
                      className={TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}
                    >
                      {TYPE_STYLES[type]?.label ?? type}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex justify-center gap-2 lg:justify-start">
                  <FavoriteButton id={pokemon.id} showLabel />
                  <TeamButton id={pokemon.id} showLabel />
                </div>

                {pokemon.description && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {pokemon.description}
                  </p>
                )}

                <div className="mt-4 flex justify-center gap-8 text-sm text-foreground lg:justify-start">
                  <p>Taille : {formatMeasure(pokemon.height, "m")}</p>
                  <p>Poids : {formatMeasure(pokemon.weight, "kg")}</p>
                </div>

                <StatBars stats={pokemon.stats} color={premierType} />
              </div>
            </div>

            <div className="mt-6 flex w-full justify-between">
              {prev ? (
                <Button
                  variant="secondary"
                  render={<Link href={`/pokemon/${prev.id}`} transitionTypes={["nav-back"]} />}
                  nativeButton={false}
                >
                  <ChevronLeft data-icon="inline-start" />#{prev.number} {prev.name}
                  <kbd aria-hidden="true" className="hidden rounded border border-border px-1 text-xs sm:inline-flex">←</kbd>
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <Button
                  variant="secondary"
                  render={<Link href={`/pokemon/${next.id}`} transitionTypes={["nav-forward"]} />}
                  nativeButton={false}
                >
                  #{next.number} {next.name}
                  <kbd aria-hidden="true" className="hidden rounded border border-border px-1 text-xs sm:inline-flex">→</kbd>
                  <ChevronRight data-icon="inline-end" />
                </Button>
              ) : (
                <span />
              )}
            </div>
          </Card>
        </CardTransition>
      </main>
    </div>
  );
}
