import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { parsePokemonId, getPokemonDetail } from "@/lib/pokeapi";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";
import HoloReveal from "@/components/HoloReveal";
import StatBars from "@/components/StatBars";
import PokemonDetailSkeleton from "@/components/PokemonDetailSkeleton";

// Transition directionnelle : vient-on de la grille / du bouton Suivant
// (nav-forward), ou du bouton Précédent (nav-back) ? Sans type (navigation
// directe ou retour navigateur), pas d'animation directionnelle.
function DetailTransition({ children }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}

// La page elle-même ne lit pas "params" directement : ça la rendrait
// dynamique pour tout le monde. On passe la promesse au composant enfant,
// dans un <Suspense>, pour que le reste de la route reste prérendable.
export default function PokemonPage({ params }) {
  return (
    <DetailTransition>
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
    </DetailTransition>
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

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main id="main-content" className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          render={<Link href="/" transitionTypes={["nav-back"]} />}
          nativeButton={false}
          className="mb-6"
        >
          <ArrowLeft data-icon="inline-start" />
          Retour au Pokédex
        </Button>

        <HoloReveal>
          <Card className="relative items-center p-6 text-center">
            <div className="absolute top-4 right-4">
              <FavoriteButton id={pokemon.id} />
            </div>

            {/* Élément partagé : la même image que sur la carte de la
                grille (même "name"), pour qu'elle glisse jusqu'ici. */}
            <ViewTransition name={`pokemon-image-${pokemon.id}`} share="pokemon-image-morph">
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={200}
                height={200}
                className="h-40 w-40 object-contain"
              />
            </ViewTransition>

            <p className="text-sm text-muted-foreground">#{number}</p>
            <h1 className="font-heading text-3xl font-bold capitalize text-foreground">
              {pokemon.name}
            </h1>

            <div className="mt-2">
              <TeamButton id={pokemon.id} />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  className={TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}
                >
                  {TYPE_STYLES[type]?.label ?? type}
                </Badge>
              ))}
            </div>

            {pokemon.description && (
              <p className="mt-4 text-sm text-muted-foreground">
                {pokemon.description}
              </p>
            )}

            <div className="mt-4 flex justify-center gap-8 text-sm text-foreground">
              <p>Taille : {pokemon.height} m</p>
              <p>Poids : {pokemon.weight} kg</p>
            </div>

            <StatBars stats={pokemon.stats} />

            <div className="mt-6 flex w-full justify-between">
              {pokemon.id > 1 ? (
                <Button
                  variant="secondary"
                  render={<Link href={`/pokemon/${pokemon.id - 1}`} transitionTypes={["nav-back"]} />}
                  nativeButton={false}
                >
                  <ChevronLeft data-icon="inline-start" />
                  Précédent
                </Button>
              ) : (
                <span />
              )}
              {pokemon.id < 1025 ? (
                <Button
                  variant="secondary"
                  render={<Link href={`/pokemon/${pokemon.id + 1}`} transitionTypes={["nav-forward"]} />}
                  nativeButton={false}
                >
                  Suivant
                  <ChevronRight data-icon="inline-end" />
                </Button>
              ) : (
                <span />
              )}
            </div>
          </Card>
        </HoloReveal>
      </main>
    </div>
  );
}
