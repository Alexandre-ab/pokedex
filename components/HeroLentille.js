"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TYPE_STYLES } from "@/lib/typeStyles";
import {
  illustrationChromatique,
  illustrationNormale,
  numeroSurQuatre,
  separerMilliers,
} from "@/lib/vitrine";

// La lentille WebGL n'est chargée que dans le navigateur (ssr: false), dans
// un fichier JS séparé : le catalogue ne télécharge jamais « ogl ».
// (next/dynamic avec ssr: false n'est permis que dans un Client Component.)
const HeroLentilleCanvas = dynamic(() => import("@/components/HeroLentilleCanvas"), {
  ssr: false,
});

// ---------------------------------------------------------------------------
// Préférences du navigateur, lues avec useSyncExternalStore : le serveur et
// le premier rendu client utilisent la valeur « serveur » (donc le même
// HTML, aucune erreur d'hydratation), puis React relit la vraie valeur.
// ---------------------------------------------------------------------------
function abonnerMedia(requete) {
  return (prevenir) => {
    const media = window.matchMedia(requete);
    media.addEventListener("change", prevenir);
    return () => media.removeEventListener("change", prevenir);
  };
}
const REQUETE_REDUIT = "(prefers-reduced-motion: reduce)";
const REQUETE_TACTILE = "(pointer: coarse)";
const abonnerReduit = abonnerMedia(REQUETE_REDUIT);
const abonnerTactile = abonnerMedia(REQUETE_TACTILE);
const pasAbonnement = () => () => {};

// Le serveur suppose « moins d'animations » : rien de WebGL dans le HTML.
function useMoinsAnimations() {
  return useSyncExternalStore(
    abonnerReduit,
    () => window.matchMedia(REQUETE_REDUIT).matches,
    () => true
  );
}

function usePointeurTactile() {
  return useSyncExternalStore(
    abonnerTactile,
    () => window.matchMedia(REQUETE_TACTILE).matches,
    () => false
  );
}

// Mode « économie de données » du navigateur : pas de textures en plus.
function useEconomieDonnees() {
  return useSyncExternalStore(
    pasAbonnement,
    () => Boolean(navigator.connection?.saveData),
    () => false
  );
}

// ---------------------------------------------------------------------------
// Hero « Lentille » de la page d'accueil.
// - Un spécimen emblématique en grand, son numéro géant DERRIÈRE lui et une
//   aura douce de la couleur de son type.
// - La lentille WebGL révèle sa variante chromatique sous le curseur (ou se
//   promène seule sur écran tactile).
// - Repli sans WebGL ou avec prefers-reduced-motion : image fixe + le même
//   bouton pour passer en variante chromatique. Contenu identique partout.
//
// specimens : [{ id, nom, types }] (calculés côté serveur, app/page.js)
// total : nombre de Pokémon du catalogue (1025)
// ---------------------------------------------------------------------------
export default function HeroLentille({ specimens, total }) {
  const [index, setIndex] = useState(0);
  const [chromatique, setChromatique] = useState(false);
  const [enPause, setEnPause] = useState(false);
  // État de la lentille WebGL : "chargement" | "pret" | "erreur".
  const [etatCanvas, setEtatCanvas] = useState("chargement");

  const moinsAnimations = useMoinsAnimations();
  const tactile = usePointeurTactile();
  const economie = useEconomieDonnees();

  const specimen = specimens[index];
  const numero = numeroSurQuatre(specimen.id);
  const typePrincipal = specimen.types[0] ?? "normal";
  const totalTexte = separerMilliers(total);

  // Faut-il tenter la lentille WebGL ?
  const utiliseLentille = !moinsAnimations && !economie && etatCanvas !== "erreur";
  // La lentille a dessiné son premier rendu : on peut cacher l'image fixe.
  const lentillePrete = utiliseLentille && etatCanvas === "pret";
  const modeAuto = utiliseLentille && tactile;

  const consigne = !utiliseLentille
    ? "Utilisez le bouton pour comparer l'illustration normale et la variante chromatique."
    : modeAuto
      ? "La lentille se promène sur le spécimen et révèle sa variante chromatique."
      : "Survolez le spécimen : la lentille révèle sa variante chromatique.";

  return (
    <section
      aria-labelledby="titre-vitrine"
      className="relative isolate grid min-h-[calc(100svh-4rem)] grid-cols-1 gap-y-6 overflow-clip px-4 pt-4 pb-24 [grid-template-areas:'titre'_'scene'_'carte'] sm:px-6 lg:min-h-[100svh] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:px-10 lg:py-10 lg:[grid-template-areas:'titre_scene'_'carte_scene']"
    >
      {/* ================= Titre + accès au catalogue ================= */}
      <div className="relative z-10 flex flex-col items-start [grid-area:titre]">
        <p className="text-index tracking-[0.04em] text-muted-foreground uppercase">
          Pokédex national · lentille chromatique
        </p>
        {/* A3 : chaque ligne monte depuis un masque ; A4 : le mot-clé
            « éclot » (droit -> italique doux). Animations CSS uniquement
            (motion-safe:) : le texte est là dès le HTML, sans attendre JS. */}
        <h1 id="titre-vitrine" className="titre-impact mt-3 text-foreground">
          <span className="block overflow-clip pb-[0.06em]">
            <span className="block motion-safe:animate-[lentille-montee_700ms_var(--ease-lens)_both]">
              {totalTexte} espèces.
            </span>
          </span>
          <span className="block overflow-clip pb-[0.1em]">
            <span className="block motion-safe:animate-[lentille-montee_700ms_var(--ease-lens)_80ms_both]">
              Regardez-les{" "}
              <span className="mot-cle motion-safe:animate-[lentille-eclosion_450ms_var(--ease-fluid)_650ms_both]">
                de plus près
              </span>
              .
            </span>
          </span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground lg:text-lg">
          Le Pokédex national complet : illustrations officielles, recherche,
          filtres par type, favoris et sacoche d&apos;équipe.
        </p>
        <a
          href="#catalogue"
          className="group/cta mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-shadow motion-safe:duration-200"
        >
          Explorer les {totalTexte}
          <ArrowDown
            className="size-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/cta:translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>

      {/* ================= Scène : aura, numéro géant, spécimen ================= */}
      <div className="relative flex flex-col items-center justify-center gap-5 [grid-area:scene]">
        <div className="relative flex items-center justify-center">
          {/* A2 : aura douce du type principal (CSS, transition 500 ms). */}
          <div
            aria-hidden="true"
            className="aura-lentille pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ "--aura-couleur": `var(--type-${typePrincipal})` }}
          />
          {/* Numéro monumental DERRIÈRE le spécimen : profondeur immédiate.
              Décoratif (le vrai numéro est lu dans la carte du spécimen). */}
          <p
            aria-hidden="true"
            className="chiffre-monument pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none motion-safe:transition-colors motion-safe:duration-500"
            style={{
              color: `color-mix(in oklab, var(--type-${typePrincipal}) 24%, var(--background))`,
            }}
          >
            {numero}
          </p>

          {/* Boîte carrée du spécimen : l'image fixe (rendue côté serveur,
              préchargée pour le LCP) et le canvas superposé EXACTEMENT
              dessus (même boîte) : aucun décalage de mise en page. */}
          <div className="relative aspect-square w-[min(78vw,44svh)] sm:w-[min(60vw,48svh)] lg:w-[min(36vw,60svh)]">
            <Image
              key={specimen.id}
              src={illustrationNormale(specimen.id)}
              alt={`${specimen.nom}, illustration officielle${chromatique ? " en variante chromatique" : ""}`}
              width={475}
              height={475}
              sizes="(min-width: 1024px) 36vw, 78vw"
              preload={specimen.id === specimens[0].id}
              className={`size-full object-contain transition-opacity ${
                lentillePrete ? "opacity-0 delay-300 duration-150" : "opacity-100 duration-0"
              }`}
            />

            {/* Repli (pas de WebGL, ou textures en cours de chargement) :
                la variante chromatique est une 2e image posée dessus. */}
            {chromatique && !lentillePrete && (
              <Image
                key={`chroma-${specimen.id}`}
                src={illustrationChromatique(specimen.id)}
                alt=""
                width={475}
                height={475}
                sizes="(min-width: 1024px) 36vw, 78vw"
                className="absolute inset-0 size-full object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:duration-400"
              />
            )}

            {utiliseLentille && (
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  lentillePrete ? "opacity-100" : "opacity-0"
                }`}
              >
                <HeroLentilleCanvas
                  normalSrc={illustrationNormale(specimen.id)}
                  chromaSrc={illustrationChromatique(specimen.id)}
                  chromatique={chromatique}
                  auto={modeAuto}
                  enPause={modeAuto && enPause}
                  onEtat={setEtatCanvas}
                />
              </div>
            )}
          </div>
        </div>

        {/* Commandes de la lentille, sous le spécimen. */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <p className="max-w-xs text-sm text-pretty text-muted-foreground">{consigne}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              aria-pressed={chromatique}
              onClick={() => setChromatique((valeur) => !valeur)}
              className="group/chroma inline-flex min-h-11 items-center gap-3 rounded-full bg-card py-1.5 pr-2 pl-4 text-sm font-semibold text-foreground shadow-soft hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-shadow motion-safe:duration-200"
            >
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Variante chromatique
              {/* Interrupteur visuel ; l'état est donné par aria-pressed. */}
              <span
                aria-hidden="true"
                className="relative h-6 w-10 rounded-full bg-muted group-aria-pressed/chroma:bg-primary motion-safe:transition-colors motion-safe:duration-200"
              >
                <span className="absolute top-1 left-1 size-4 rounded-full bg-card shadow-soft group-aria-pressed/chroma:translate-x-4 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </span>
            </button>

            {/* Animation autonome (écran tactile) : on doit pouvoir la
                mettre en pause (WCAG 2.2.2). Le nom du bouton dit l'action
                qu'il va faire : « Reprendre » quand la lentille est en pause.
                (Pas d'aria-pressed en plus : un nom qui change ET un état
                « enfoncé » seraient lus en double par un lecteur d'écran.) */}
            {modeAuto && lentillePrete && (
              <button
                type="button"
                aria-label={enPause ? "Reprendre la lentille" : "Mettre la lentille en pause"}
                onClick={() => setEnPause((valeur) => !valeur)}
                className="inline-flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {enPause ? (
                  <Play className="size-4" aria-hidden="true" />
                ) : (
                  <Pause className="size-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= Carte du spécimen + sélecteur ================= */}
      <div className="relative z-10 w-full self-end [grid-area:carte] sm:max-w-md">
        <div className="rounded-3xl bg-card p-4 shadow-soft dark:ring-1 dark:ring-border">
          <div className="flex items-start justify-between gap-3">
            {/* aria-live : le changement de spécimen est annoncé. */}
            <div aria-live="polite" className="min-w-0">
              <p className="text-index text-muted-foreground">
                <span className="sr-only">Numéro </span>#{numero}
              </p>
              <p className="truncate font-heading text-2xl leading-tight font-bold tracking-tight text-foreground">
                {specimen.nom}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {specimen.types.map((type) => (
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
            </div>
            <Link
              href={`/pokemon/${specimen.id}`}
              transitionTypes={["nav-forward"]}
              aria-label={`Voir la fiche de ${specimen.nom}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors motion-safe:duration-200"
            >
              Fiche
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Sélecteur des 4 spécimens : vrais boutons (clavier natif),
              56 px de côté, état donné par aria-pressed. */}
          <div role="group" aria-label="Choisir un spécimen" className="mt-4 flex gap-2">
            {specimens.map((choix, position) => (
              <button
                key={choix.id}
                type="button"
                aria-pressed={position === index}
                aria-label={`${choix.nom}, numéro ${choix.id}`}
                onClick={() => setIndex(position)}
                className="flex size-14 items-center justify-center rounded-full bg-muted hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-card aria-pressed:shadow-float aria-pressed:ring-2 aria-pressed:ring-primary motion-safe:transition-[background-color,box-shadow] motion-safe:duration-200"
              >
                <Image
                  src={illustrationNormale(choix.id)}
                  alt=""
                  width={44}
                  height={44}
                  sizes="44px"
                  className="size-11 object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
