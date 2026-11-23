"use client";

import { ViewTransition } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TYPE_STYLES } from "@/lib/typeStyles";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";

// Une carte pour un seul Pokémon : image, numéro (#001), nom et types.
// Cliquer sur la carte ouvre sa fiche détaillée (/pokemon/{id}).
// Les boutons favori et sacoche sont des frères du lien (pas des enfants) :
// un <button> à l'intérieur d'un <a> serait du HTML invalide et causerait
// une erreur d'hydratation.
export default function PokemonCard({ pokemon }) {
  const { id, name, image, types = [] } = pokemon;
  const number = String(id).padStart(3, "0");

  return (
    // Survol léger : juste un petit zoom au survol/au clic (transform,
    // peu coûteux même répété sur les 1 025 cartes de la grille).
    // "pokemon-card" (content-visibility, voir app/globals.css) permet au
    // navigateur de ne pas calculer le rendu des cartes hors écran.
    <motion.div
      className="pokemon-card relative"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="gap-2 p-3 pb-10">
        <Link
          href={`/pokemon/${id}`}
          transitionTypes={["nav-forward"]}
          className="flex flex-col items-center gap-2 text-center"
        >
          {/* Élément partagé : cette image glisse vers la fiche détaillée
              (même "name" que l'image de app/pokemon/[id]/page.js). */}
          <ViewTransition name={`pokemon-image-${id}`} share="pokemon-image-morph">
            <Image
              src={image}
              alt={name}
              width={120}
              height={120}
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
          </ViewTransition>
          <p className="text-sm text-muted-foreground">#{number}</p>
          <p className="font-heading text-base font-semibold capitalize text-foreground">
            {name}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {types.map((type) => (
              <Badge
                key={type}
                className={TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"}
              >
                {TYPE_STYLES[type]?.label ?? type}
              </Badge>
            ))}
          </div>
        </Link>
      </Card>
      <div className="absolute top-2 right-2">
        <FavoriteButton id={id} />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <TeamButton id={id} />
      </div>
    </motion.div>
  );
}
