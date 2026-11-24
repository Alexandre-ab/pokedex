"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TYPE_STYLES } from "@/lib/typeStyles";
import FavoriteButton from "@/components/FavoriteButton";
import TeamButton from "@/components/TeamButton";

// Une carte pour un seul Pokémon : image, numéro + nom sur une ligne, et
// types. Cliquer sur la carte ouvre sa fiche détaillée (/pokemon/{id}).
// Les boutons favori et sacoche sont sur leur propre ligne, sous les
// types : des frères du lien (jamais des enfants) sur une rangée dédiée,
// pour ne plus jamais recouvrir l'illustration.
export default function PokemonCard({ pokemon }) {
  const { id, name, nameFr, image, types = [] } = pokemon;
  const nomAffiche = nameFr ?? name;
  const number = String(id).padStart(3, "0");
  const premierType = types[0];

  // Dégradé teinté avec la couleur du premier type (via color-mix), bien
  // visible en clair comme en sombre puisqu'il se mélange à --background.
  const styleCarte = premierType
    ? {
        background: `linear-gradient(135deg, color-mix(in oklch, var(--type-${premierType}) 32%, var(--background)) 0%, var(--background) 100%)`,
      }
    : undefined;

  return (
    // Survol léger : transition CSS sur transform (accélérée par le GPU, et
    // bien moins lourde que 1 025 composants motion). Désactivée si
    // l'utilisateur préfère moins d'animations (variante "motion-safe").
    // "pokemon-card" (content-visibility, voir app/globals.css) permet au
    // navigateur de ne pas calculer le rendu des cartes hors écran.
    <div className="pokemon-card motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]">
      <Card style={styleCarte} className="gap-2 p-3">
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
              alt={nomAffiche}
              width={120}
              height={120}
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
          </ViewTransition>
          <p className="w-full truncate text-sm">
            <span className="text-xs text-muted-foreground">#{number}</span>{" "}
            <span className="font-heading font-bold capitalize text-foreground">
              {nomAffiche}
            </span>
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
        {/* Favori et sacoche : frères du lien, jamais dedans, sur leur
            propre ligne sous les types. */}
        <div className="flex items-center justify-center gap-1">
          <FavoriteButton id={id} />
          <TeamButton id={id} />
        </div>
      </Card>
    </div>
  );
}
