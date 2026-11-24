"use client";

import { motion, useReducedMotion } from "motion/react";

// Labels français des statistiques de base, dans l'ordre affiché par l'API.
const STAT_LABELS = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Att. Spé.",
  "special-defense": "Déf. Spé.",
  speed: "Vitesse",
};

// Valeur de base maximale théorique, pour dessiner la barre à l'échelle.
const STAT_MAX = 255;

// Largeur d'une barre, en pourcentage de la piste.
function largeur(valeur) {
  return `${Math.min(100, (valeur / STAT_MAX) * 100)}%`;
}

// Statistiques de base : une ligne par stat (libellé | barre | valeur), puis
// le total (BST) discret.
//
// Les barres arrondies se remplissent en cascade, une seule fois, dans la
// couleur du premier type ("color", ex. "fire"). Seul `scaleX` est animé (la
// largeur finale est fixe) : transformation composite, sans recalcul de mise
// en page. Avec prefers-reduced-motion, elles s'affichent directement à leur
// valeur finale.
export default function StatBars({ stats, color }) {
  const reduceMotion = useReducedMotion();
  const total = stats.reduce((somme, stat) => somme + stat.value, 0);
  const couleurBarre = color ? `var(--type-${color})` : "var(--foreground)";

  return (
    <section aria-labelledby="titre-mesures" className="mt-8">
      <h2 id="titre-mesures" className="font-heading text-lg font-semibold tracking-tight">
        Statistiques de base
      </h2>

      {/* Libellé et valeur sont du vrai texte ; la barre est décorative. */}
      <dl className="mt-4 flex flex-col gap-3">
        {stats.map((stat, index) => (
          <div key={stat.name} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
            <dt className="text-sm text-muted-foreground">{STAT_LABELS[stat.name] ?? stat.name}</dt>
            <dd aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-muted">
              {/* Remplissage : seul scaleX est animé. */}
              <motion.span
                className="block h-full origin-left rounded-full"
                style={{ width: largeur(stat.value), backgroundColor: couleurBarre }}
                initial={{ scaleX: reduceMotion ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }
                }
              />
            </dd>
            <dd className="text-right font-mono text-sm font-medium text-foreground tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Total des statistiques de base (BST), discret. */}
      <p className="mt-4 flex items-baseline justify-between border-t border-border pt-3 text-sm text-muted-foreground">
        <span>Total (BST)</span>
        <span className="font-mono text-base font-semibold text-foreground tabular-nums">{total}</span>
      </p>
    </section>
  );
}
