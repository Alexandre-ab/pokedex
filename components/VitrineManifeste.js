"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import { separerMilliers } from "@/lib/vitrine";

// Le titre du manifeste, mot par mot. `cle: true` marque LE mot mis en
// scène en Fraunces italique (un seul par titre, docs/STYLE_GUIDE.md §3).
const MOTS_TITRE = [
  { texte: "Un" },
  { texte: "Pokédex" },
  { texte: "se" },
  { texte: "consulte" },
  { texte: "chaque" },
  { texte: "jour." },
  { texte: "Celui-ci" },
  { texte: "se" },
  { texte: "contemple", cle: true },
  { texte: "aussi." },
];

// ---------------------------------------------------------------------------
// Manifeste de la vitrine : section « nuit » juste sous le hero.
// - A5 : au fil du scroll, chaque mot du titre passe de la teinte brume à la
//   teinte os (couleur seulement : le texte reste lisible à tout instant).
// - A4 : le mot-clé passe d'une italique sèche à une italique douce.
// - Trois chiffres réels, calculés côté serveur (app/page.js).
// prefers-reduced-motion : texte directement dans son état final.
//
// total : nombre d'espèces ; nombreTypes : 18 ; nombreGenerations : 9.
// ---------------------------------------------------------------------------
export default function VitrineManifeste({ total, nombreTypes, nombreGenerations }) {
  const titreRef = useRef(null);
  const reduit = useReducedMotion();

  // 0 quand le haut du titre arrive aux 3/4 de l'écran, 1 quand son bas
  // atteint 40 % de la hauteur : la révélation suit la lecture.
  const { scrollYProgress } = useScroll({
    target: titreRef,
    offset: ["start 75%", "end 40%"],
  });

  const chiffres = [
    { valeur: separerMilliers(total), libelle: "espèces" },
    { valeur: nombreTypes, libelle: "types" },
    { valeur: nombreGenerations, libelle: "générations" },
  ];

  return (
    // Le fond « nuit » suit le thème (#14161F en clair, #1A1D27 en sombre).
    // Coins arrondis en haut : la nuit se pose sur le papier comme une
    // carte. Le nuancier des types (juste dessous) la prolonge et porte les
    // coins arrondis du bas. Marges latérales (mx-*) : les coins arrondis
    // respirent sur le papier au lieu de toucher les bords de la fenêtre.
    <section
      aria-labelledby="titre-manifeste"
      className="relative isolate mx-3 rounded-t-[1.75rem] bg-vitrine-nuit sm:mx-5 sm:rounded-t-[2.5rem] lg:mx-6"
    >
      {/* Classe « dark » : à l'intérieur, tous les tokens prennent leur
          valeur sombre (accent #FF5A6E lisible sur la nuit).
          Espacements resserrés : un bloc compact, sans grand vide noir. */}
      <div className="dark px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        {/* Desktop : 2 colonnes équilibrées, alignées en bas — le titre à
            gauche (7/12), le texte et les chiffres clés à droite (5/12). */}
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-index tracking-[0.04em] text-vitrine-brume uppercase">Manifeste</p>

            {/* Une seule variable CSS (--progression) est mise à jour par
                motion à chaque image ; chaque mot en déduit sa couleur
                (.mot-manifeste dans globals.css). */}
            <motion.h2
              ref={titreRef}
              id="titre-manifeste"
              className="titre-impact mt-3 max-w-[18ch] text-vitrine-os"
              style={{ "--progression": reduit ? 1 : scrollYProgress }}
            >
              {MOTS_TITRE.map((mot, position) => {
                // Les mots s'allument l'un après l'autre sur 80 % du trajet.
                const debut = (position / MOTS_TITRE.length) * 0.8;
                return (
                  <span key={position}>
                    {mot.cle ? (
                      <span className="mot-cle mot-manifeste-cle" style={{ "--debut": debut }}>
                        {mot.texte}
                      </span>
                    ) : (
                      <span className="mot-manifeste" style={{ "--debut": debut }}>
                        {mot.texte}
                      </span>
                    )}
                    {position < MOTS_TITRE.length - 1 && " "}
                  </span>
                );
              })}
            </motion.h2>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-5">
            <p className="max-w-[60ch] text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-normal text-pretty text-vitrine-os">
              Ici, rien n&apos;est décoratif : chaque illustration est officielle et
              chaque chiffre vient des données du Pokédex. Le catalogue complet
              reste à un clic, juste en dessous.
            </p>

            {/* Chiffres réels (pas écrits en dur), en mono tabulaire. */}
            <dl className="flex flex-wrap gap-x-10 gap-y-6 sm:gap-x-12">
              {chiffres.map((chiffre) => (
                <div key={chiffre.libelle} className="flex flex-col-reverse gap-1">
                  <dt className="text-index tracking-[0.04em] text-vitrine-brume uppercase">
                    {chiffre.libelle}
                  </dt>
                  <dd className="font-mono text-[clamp(2rem,1.4rem+2vw,3.25rem)] leading-none font-bold tracking-[-0.04em] text-vitrine-os tabular-nums">
                    {chiffre.valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
