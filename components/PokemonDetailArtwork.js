"use client";

import { useState, ViewTransition } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import HoloReveal from "@/components/HoloReveal";
import { illustrationChromatique } from "@/lib/vitrine";

// Illustration de la fiche détaillée, avec bascule Normale ↔ Chromatique
// (« shiny »), dans l'esprit de la Lentille du Hero : même cadre, on change
// seulement la « pellicule ».
//
// - L'image normale reste toujours montée, dans le <ViewTransition> partagé
//   avec la carte du catalogue : le morph carte → fiche n'est pas touché.
// - L'image chromatique n'est montée (donc téléchargée) qu'au premier survol
//   ou clic sur le bouton : aucune requête inutile au chargement de la page.
// - Le passage d'une image à l'autre est un simple fondu CSS (opacité),
//   désactivé avec prefers-reduced-motion (préfixe motion-safe:).
// - Si l'illustration chromatique ne charge pas, on revient à l'image normale
//   et le bouton passe en état « indisponible » (pas d'icône d'image cassée).
export default function PokemonDetailArtwork({ id, nom, imageNormale, glowType }) {
  // Le visiteur a-t-il demandé la variante chromatique ?
  const [chromatique, setChromatique] = useState(false);
  // Faut-il monter l'image chromatique ? (devient vrai au survol / clic)
  const [monterShiny, setMonterShiny] = useState(false);
  // L'image chromatique est-elle téléchargée ?
  const [shinyChargee, setShinyChargee] = useState(false);
  // L'image chromatique a-t-elle échoué ?
  const [indisponible, setIndisponible] = useState(false);

  // On n'affiche la variante que lorsqu'elle est vraiment prête.
  const afficheShiny = chromatique && shinyChargee && !indisponible;

  // Précharge la variante (survol ou focus du bouton, puis clic).
  function prechargerShiny() {
    if (!indisponible) setMonterShiny(true);
  }

  function basculer() {
    prechargerShiny();
    setChromatique((actuel) => !actuel);
  }

  function gererErreurShiny() {
    setIndisponible(true);
    setChromatique(false);
    setMonterShiny(false);
  }

  // Classes communes aux deux images (même taille, superposées).
  const tailleImage = "h-56 w-56 object-contain drop-shadow-lg sm:h-64 sm:w-64 lg:h-80 lg:w-80";
  const fondu = "motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out";

  return (
    <>
      {/* Bouton pilule en haut à droite du panneau d'illustration. */}
      <button
        type="button"
        onClick={basculer}
        onPointerEnter={prechargerShiny}
        onFocus={prechargerShiny}
        disabled={indisponible}
        aria-pressed={chromatique}
        title={indisponible ? "Illustration chromatique indisponible" : undefined}
        className={`absolute top-3 right-3 z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-safe:transition-colors motion-safe:duration-300 ${
          chromatique
            ? "bg-primary text-primary-foreground"
            : "bg-card/90 text-foreground hover:bg-card dark:ring-1 dark:ring-border"
        }`}
      >
        <Sparkles aria-hidden="true" className="size-4" />
        {indisponible ? "Chromatique indisponible" : "Chromatique"}
      </button>

      <HoloReveal glowType={glowType}>
        {/* Élément partagé : même "name" que l'image de la carte du
            catalogue, pour qu'elle glisse jusqu'ici. On y englobe les deux
            images pour que la variante visible suive aussi le morph. */}
        <ViewTransition name={`pokemon-image-${id}`} share="pokemon-image-morph">
          <div className="relative">
            {/* Image normale : toujours là (LCP), masquée en fondu si shiny. */}
            <Image
              src={imageNormale}
              alt={afficheShiny ? `${nom}, variante chromatique` : nom}
              width={320}
              height={320}
              className={`${tailleImage} ${fondu} ${afficheShiny ? "opacity-0" : "opacity-100"}`}
              preload
            />

            {/* Image chromatique : décorative (l'alt ci-dessus décrit déjà
                ce qui est visible), montée seulement à la demande. */}
            {monterShiny && !indisponible && (
              <Image
                src={illustrationChromatique(id)}
                alt=""
                aria-hidden="true"
                width={320}
                height={320}
                loading="eager"
                onLoad={() => setShinyChargee(true)}
                onError={gererErreurShiny}
                className={`absolute inset-0 ${tailleImage} ${fondu} ${afficheShiny ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>
        </ViewTransition>
      </HoloReveal>
    </>
  );
}
