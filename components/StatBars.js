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

// Barres de statistiques qui se remplissent en cascade, une seule fois à
// l'affichage de la fiche. Avec prefers-reduced-motion, elles apparaissent
// directement à leur valeur finale, sans animation.
export default function StatBars({ stats }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-6 flex flex-col gap-2 text-left">
      {stats.map((stat, index) => {
        const pourcentage = Math.min(100, (stat.value / STAT_MAX) * 100);
        return (
          <div key={stat.name}>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{STAT_LABELS[stat.name] ?? stat.name}</span>
              <span>{stat.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              {/* La largeur finale est fixe (style) ; seul `scaleX` est
                  animé — une transformation composite, qui ne déclenche
                  pas de recalcul de layout, contrairement à `width`. */}
              <motion.div
                className="h-2 origin-left rounded-full bg-secondary"
                style={{ width: `${pourcentage}%` }}
                initial={{ scaleX: reduceMotion ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, delay: index * 0.08, ease: "easeOut" }
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
