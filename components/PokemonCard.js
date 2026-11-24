"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TYPE_STYLES } from "@/lib/typeStyles";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";

// Carte Pokémon douce et facile à scanner, lue de haut en bas :
//   1. numéro discret "#0025" ;
//   2. illustration sur un fond très légèrement teinté par le type principal
//      (aucune ligne, aucune grille) ;
//   3. nom bien lisible + pastilles de type arrondies et contrastées ;
//   4. boutons Favori | Sacoche confortables.
// Le lien (vers /pokemon/{id}) couvre 1 à 3 ; les boutons sont ses frères,
// jamais ses enfants (pas d'élément interactif dans un lien).
//
// Performance (1 025 cartes) : aucun composant motion, aucun effet lourd.
// Le survol est 100 % CSS (translation + ombre), désactivé si l'utilisateur
// préfère moins d'animations (variante "motion-safe").
// La classe "pokemon-card" (content-visibility, voir app/globals.css) évite
// de calculer le rendu des cartes hors écran.
export default function PokemonCard({ pokemon }) {
  const { id, name, nameFr, image, types = [] } = pokemon;
  const nomAffiche = nameFr ?? name;
  // Numéro sur 4 chiffres : 25 -> "#0025".
  const numero = String(id).padStart(4, "0");
  const premierType = types[0] ?? "normal";
  const couleurType = `var(--type-${premierType})`;

  return (
    <article className="pokemon-card group relative flex flex-col rounded-2xl bg-card p-3 shadow-soft ring-1 ring-border motion-safe:transition-[translate,box-shadow] motion-safe:duration-200 motion-safe:ease-out hover:shadow-float motion-safe:hover:-translate-y-0.5">
      <Link
        href={`/pokemon/${id}`}
        transitionTypes={["nav-forward"]}
        className="flex flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {/* 1. Numéro discret. */}
        <span className="px-1 pb-2 text-index text-muted-foreground">#{numero}</span>

        {/* 2. Fond doux teinté au type principal (color-mix : marche en clair
            comme en sombre). */}
        <span
          className="relative flex aspect-square items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklch, ${couleurType} 12%, var(--card))`,
          }}
        >
          {/* Élément partagé : cette image glisse vers la fiche détaillée
              (même "name" que l'image de app/pokemon/[id]/page.js). */}
          <ViewTransition name={`pokemon-image-${id}`} share="pokemon-image-morph">
            <Image
              src={image}
              alt={nomAffiche}
              width={140}
              height={140}
              className="relative h-auto w-[70%] object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-105"
            />
          </ViewTransition>
        </span>

        {/* 3. Nom lisible. */}
        <span className="block truncate px-1 pt-3 font-heading text-lg leading-tight font-semibold tracking-tight text-foreground">
          {nomAffiche}
        </span>
      </Link>

      {/* Pastilles de type : couleurs du thème (--type-*), contraste
          garanti par --type-*-foreground. */}
      <div className="flex flex-wrap gap-1.5 px-1 pt-2 pb-3">
        {types.map((type) => (
          <Badge
            key={type}
            className={`h-6 rounded-full px-2.5 text-xs font-medium ${
              TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"
            }`}
          >
            {TYPE_STYLES[type]?.label ?? type}
          </Badge>
        ))}
      </div>

      {/* 4. Actions : deux boutons égaux et confortables. */}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <FavoriteButton id={id} />
        <TeamButton id={id} />
      </div>
    </article>
  );
}
