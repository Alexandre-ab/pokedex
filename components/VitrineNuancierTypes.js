"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { EVENEMENT_CHOIX_TYPE } from "@/lib/vitrine";
import TitreVitrine from "@/components/TitreVitrine";

// ---------------------------------------------------------------------------
// Nuancier vivant des 18 types (section « nuit », suite du manifeste).
//
// - Une barre de 18 segments : largeur proportionnelle au nombre de Pokémon
//   de chaque type (A7 : les segments s'étirent une fois, à l'arrivée).
//   Elle est décorative (aria-hidden) : la même information est dans la
//   liste de boutons juste dessous, lisible par tous.
// - 18 boutons (couleur --type-x + texte --type-x-foreground, >= 4,5:1).
//   Un clic (ou Entrée) envoie l'événement « pokedex:select-type » :
//   PokemonGrid pré-sélectionne ce type, puis on descend au catalogue.
//
// comptes : [{ type: "water", nombre: 158 }, ...] (calculés côté serveur
// depuis typeMap, déjà chargé par app/page.js : aucun appel réseau en plus).
// ---------------------------------------------------------------------------
export default function VitrineNuancierTypes({ comptes }) {
  const reduit = useReducedMotion();

  // Un Pokémon à deux types compte dans chacun : le total dépasse 1 025.
  const somme = comptes.reduce((total, compte) => total + compte.nombre, 0);

  function choisir(type) {
    // 1. Le catalogue pré-sélectionne le type (écouteur dans PokemonGrid).
    window.dispatchEvent(new CustomEvent(EVENEMENT_CHOIX_TYPE, { detail: { type } }));

    // 2. On descend au catalogue, puis on y place le focus (son titre) pour
    //    que le clavier et les lecteurs d'écran suivent le déplacement.
    const catalogue = document.getElementById("catalogue");
    if (!catalogue) return;
    catalogue.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
    document.getElementById("titre-catalogue")?.focus({ preventScroll: true });
  }

  return (
    // Même nuit que le manifeste, coins arrondis en bas seulement : les deux
    // sections forment une seule « carte » sombre posée sur le papier.
    <section
      aria-labelledby="titre-nuancier"
      className="relative isolate mx-3 -mt-px rounded-b-[1.75rem] bg-vitrine-nuit sm:mx-5 sm:rounded-b-[2.5rem] lg:mx-6"
    >
      {/* Classe « dark » : couleurs de type et accent en version sombre. */}
      {/* Espacements resserrés, et un filet discret qui sépare le nuancier
          du manifeste au-dessus (même carte sombre). */}
      <div className="dark px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <TitreVitrine
              id="titre-nuancier"
              surtitre="Nuancier des types"
              debut="Dix-huit types, une seule"
              motCle="palette"
              surtitreClassName="text-vitrine-brume"
              titreClassName="max-w-[16ch] text-vitrine-os"
            />
            <p className="max-w-sm text-base leading-relaxed text-pretty text-vitrine-brume">
              Chaque segment est proportionnel au nombre de Pokémon du type. Un
              Pokémon à deux types compte deux fois. Choisissez un type pour
              l&apos;afficher dans le catalogue.
            </p>
          </div>

          {/* A7 — Barre empilée des 18 types (décorative). */}
          <div
            aria-hidden="true"
            className="mt-[clamp(2rem,1.5rem+2vw,3.5rem)] flex h-4 gap-0.5 overflow-clip rounded-full sm:h-5"
          >
            {comptes.map((compte, position) => (
              <motion.span
                key={compte.type}
                className="h-full origin-left first:rounded-l-full last:rounded-r-full"
                style={{
                  flexGrow: compte.nombre,
                  flexBasis: 0,
                  backgroundColor: `var(--type-${compte.type})`,
                }}
                initial={reduit ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.6,
                  delay: position * 0.025,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </div>

          {/* Les 18 types, du plus fréquent au plus rare. */}
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {comptes.map((compte) => {
              const libelle = TYPE_STYLES[compte.type]?.label ?? compte.type;
              const part = Math.round((compte.nombre / somme) * 1000) / 10;
              return (
                <li key={compte.type}>
                  <button
                    type="button"
                    onClick={() => choisir(compte.type)}
                    style={{
                      backgroundColor: `var(--type-${compte.type})`,
                      color: `var(--type-${compte.type}-foreground)`,
                    }}
                    className="group/type flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5"
                  >
                    <span className="truncate text-sm font-semibold">{libelle}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-sm tabular-nums">{compte.nombre}</span>
                      <span className="sr-only">
                        Pokémon ({String(part).replace(".", ",")} %). Afficher dans le catalogue.
                      </span>
                      <ArrowDown
                        aria-hidden="true"
                        className="size-3.5 opacity-70 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/type:translate-y-0.5"
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
