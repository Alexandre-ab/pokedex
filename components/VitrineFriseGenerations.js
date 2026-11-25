"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { illustrationNormale, numeroSurQuatre } from "@/lib/vitrine";

// Écran large (lg, 1024 px) : lu avec useSyncExternalStore. Le serveur et le
// premier rendu client supposent « pas large » (piste native, même HTML :
// aucune erreur d'hydratation), puis React relit la vraie valeur.
const REQUETE_LARGE = "(min-width: 1024px)";
function abonnerLarge(prevenir) {
  const media = window.matchMedia(REQUETE_LARGE);
  media.addEventListener("change", prevenir);
  return () => media.removeEventListener("change", prevenir);
}
function useEcranLarge() {
  return useSyncExternalStore(
    abonnerLarge,
    () => window.matchMedia(REQUETE_LARGE).matches,
    () => false
  );
}

// ---------------------------------------------------------------------------
// Frise des 9 générations (I Kanto -> IX Paldea), sur le papier.
//
// - Desktop (lg) avec animations : la section est épinglée (sticky) et le
//   scroll vertical fait glisser la piste horizontalement (A8). Seul un
//   `transform: translateX` change : 100 % GPU, aucune mise en page.
//   La largeur de chaque panneau est proportionnelle à son nombre d'espèces.
// - Mobile, ou prefers-reduced-motion : piste horizontale native
//   (overflow-x-auto + scroll-snap), qu'on fait glisser au doigt.
//
// generations : [{ numero, region, debut, fin, especes, starters: [{ id, nom }] }]
// (préparées côté serveur dans app/page.js, à partir de lib/vitrine.js)
// ---------------------------------------------------------------------------
export default function VitrineFriseGenerations({ generations }) {
  const sectionRef = useRef(null);
  const pisteRef = useRef(null);

  const large = useEcranLarge();
  const reduit = useReducedMotion();
  const epinglee = large && !reduit;

  // Distance horizontale à parcourir (largeur de la piste - largeur visible),
  // en px. C'est une motion value (pas un état React) : la changer ne
  // provoque aucun nouveau rendu.
  const distance = useMotionValue(0);

  // Progression dans la section : 0 quand son haut touche le haut de
  // l'écran, 1 quand son bas touche le bas de l'écran.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Translation de la piste : 1 px de scroll vertical = 1 px vers la gauche.
  const x = useTransform(() => -scrollYProgress.get() * distance.get());
  // Hauteur de la section : un écran + la distance horizontale à parcourir.
  const hauteurEnPlus = useTransform(() => `${distance.get()}px`);

  // Mesure de la piste (au montage et à chaque redimensionnement).
  useEffect(() => {
    if (!epinglee) return;
    const piste = pisteRef.current;
    const cadre = piste.parentElement;
    const mesurer = () => distance.set(Math.max(0, piste.scrollWidth - cadre.clientWidth));
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(piste);
    observateur.observe(cadre);
    return () => {
      observateur.disconnect();
      distance.set(0);
    };
  }, [epinglee, distance]);

  // Clavier : quand le focus entre dans un panneau hors champ, on fait
  // défiler la page jusqu'au scroll qui centre ce panneau (sinon le focus
  // serait invisible, caché à droite de l'écran).
  function suivreFocus(evenement) {
    if (!epinglee) return;
    const panneau = evenement.target.closest("[data-panneau]");
    const section = sectionRef.current;
    const trajet = distance.get();
    if (!panneau || !section || trajet === 0) return;
    const cadre = pisteRef.current.parentElement.clientWidth;
    const voulu = panneau.offsetLeft + panneau.offsetWidth / 2 - cadre / 2;
    const decalage = Math.min(Math.max(voulu, 0), trajet);
    const hautSection = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: hautSection + decalage, behavior: "instant" });
  }

  return (
    <motion.section
      ref={sectionRef}
      aria-labelledby="titre-frise"
      style={epinglee ? { "--hauteur-en-plus": hauteurEnPlus } : undefined}
      className={epinglee ? "relative h-[calc(100svh+var(--hauteur-en-plus,0px))]" : "relative py-12 sm:py-16"}
    >
      {/* Cadre : épinglé en haut de l'écran sur desktop. overflow-clip (et
          non hidden) : la piste qui dépasse est coupée, sans créer de zone
          défilante que le focus pourrait faire bouger. */}
      <div
        className={
          epinglee
            ? "sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-clip py-10"
            : "flex flex-col gap-8"
        }
      >
        <header className="px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div>
              <p className="text-index tracking-[0.04em] text-muted-foreground uppercase">
                Frise des générations
              </p>
              <h2 id="titre-frise" className="titre-section mt-3 max-w-[18ch] text-foreground">
                Neuf régions, une seule <span className="mot-cle">numérotation</span>.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-relaxed text-pretty text-muted-foreground">
              Chaque génération ajoute une région, et les numéros reprennent là où la
              précédente s&apos;arrête.{" "}
              {epinglee
                ? "Continuez à défiler pour aller de Kanto à Paldea."
                : "Faites glisser la frise pour passer d'une région à l'autre."}
            </p>
          </div>
        </header>

        {/* Repère de progression #0001 -> #1025 (desktop épinglé) :
            décoratif, la frise reste lisible sans lui. */}
        {epinglee && (
          <div aria-hidden="true" className="flex items-center gap-3 px-10 text-index text-muted-foreground">
            <span>#0001</span>
            <span className="relative h-1 flex-1 overflow-clip rounded-full bg-muted">
              <motion.span
                className="absolute inset-0 origin-left rounded-full bg-primary"
                style={{ scaleX: scrollYProgress }}
              />
            </span>
            <span>#1025</span>
          </div>
        )}

        {/* La piste : liste ordonnée, car l'ordre chronologique EST
            l'information (I -> IX). Toujours `relative` : les textes
            sr-only (position absolue) des panneaux restent ainsi DANS la
            piste défilante, sinon ils élargiraient la page sur mobile. */}
        <motion.ol
          ref={pisteRef}
          onFocus={suivreFocus}
          style={epinglee ? { x } : undefined}
          className={
            epinglee
              ? "relative flex w-max gap-5 px-10 will-change-transform"
              : "relative flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:scroll-px-6 sm:px-6"
          }
        >
          {generations.map((generation) => (
            <li
              key={generation.numero}
              data-panneau
              // Largeur proportionnelle au nombre d'espèces (desktop).
              style={{ "--especes": generation.especes }}
              className={`flex shrink-0 flex-col rounded-3xl bg-card p-5 shadow-soft dark:ring-1 dark:ring-border ${
                epinglee
                  ? "w-[calc(13rem+var(--especes)*0.12rem)]"
                  : "w-[82vw] max-w-[22rem] snap-start"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-foreground">
                  <span className="sr-only">Génération </span>
                  <span className="titre-section block">{generation.numero}</span>
                  <span className="mt-1 block font-heading text-2xl leading-tight font-bold tracking-tight">
                    {generation.region}
                  </span>
                </h3>
                <p className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-index text-muted-foreground">
                  {generation.especes} espèces
                </p>
              </div>
              <p className="mt-2 text-index text-muted-foreground">
                <span className="sr-only">Numéros </span>#{numeroSurQuatre(generation.debut)} – #
                {numeroSurQuatre(generation.fin)}
              </p>

              {/* Les 3 Pokémon de départ de la région, liés à leur fiche.
                  Pas de nom de transition partagé ici : ces illustrations
                  existent aussi dans le catalogue (risque de doublon). */}
              <ul aria-label={`Pokémon de départ de ${generation.region}`} className="mt-5 grid grid-cols-3 gap-2">
                {generation.starters.map((starter) => (
                  <li key={starter.id}>
                    <Link
                      href={`/pokemon/${starter.id}`}
                      transitionTypes={["nav-forward"]}
                      className="group/starter flex min-h-11 flex-col items-center gap-1 rounded-2xl p-1.5 text-center hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors motion-safe:duration-200"
                    >
                      <Image
                        src={illustrationNormale(starter.id)}
                        alt=""
                        width={96}
                        height={96}
                        sizes="96px"
                        className="size-20 object-contain motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/starter:-translate-y-1 xl:size-24"
                      />
                      <span className="w-full truncate text-xs font-medium text-foreground">{starter.nom}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </motion.ol>

        {epinglee && (
          <p className="px-10 text-index text-muted-foreground">
            Largeur de chaque panneau proportionnelle à son nombre d&apos;espèces.
          </p>
        )}
      </div>
    </motion.section>
  );
}
