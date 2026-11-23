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

// Tableau de statistiques (libellé | barre pleine largeur | valeur), avec
// une ligne Total. Les barres se remplissent en cascade, une seule fois,
// dans la couleur du premier type ("color", ex. "fire"). Avec
// prefers-reduced-motion, elles apparaissent directement à leur valeur
// finale, sans animation.
export default function StatBars({ stats, color }) {
  const reduceMotion = useReducedMotion();
  const total = stats.reduce((somme, stat) => somme + stat.value, 0);
  const couleurBarre = color ? `var(--type-${color})` : "var(--foreground)";

  return (
    <div className="mt-6 flex flex-col gap-2">
      {stats.map((stat, index) => {
        const pourcentage = Math.min(100, (stat.value / STAT_MAX) * 100);
        return (
          <div
            key={stat.name}
            className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-xs"
          >
            <span className="text-muted-foreground">
              {STAT_LABELS[stat.name] ?? stat.name}
            </span>
            <div className="h-2 w-full rounded-full bg-muted">
              {/* La largeur finale est fixe (style) ; seul `scaleX` est
                  animé — une transformation composite, qui ne déclenche
                  pas de recalcul de layout, contrairement à `width`. */}
              <motion.div
                className="h-2 origin-left rounded-full"
                style={{ width: `${pourcentage}%`, backgroundColor: couleurBarre }}
                initial={{ scaleX: reduceMotion ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, delay: index * 0.08, ease: "easeOut" }
                }
              />
            </div>
            <span className="text-right font-medium text-foreground">
              {stat.value}
            </span>
          </div>
        );
      })}
      <div className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 border-t border-border pt-2 text-xs font-semibold text-foreground">
        <span>Total</span>
        <span />
        <span className="text-right">{total}</span>
      </div>
    </div>
  );
}
