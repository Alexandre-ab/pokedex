"use client";

import { motion, useReducedMotion } from "motion/react";

// Halo lumineux doux autour de l'illustration, teinté au type principal
// (glowType, ex. "fire"). Effet réservé à la fiche détaillée.
//
// Les enfants (l'illustration) ne sont PAS animés ici : leur entrée et le
// morph de l'image sont déjà gérés par <ViewTransition>, donc pas de double
// animation superposée. Seul le halo (calque décoratif) bouge, une seule
// fois : il apparaît en fondu et "respire" d'un léger zoom (opacité +
// transform, pas de recalcul de mise en page). Pas de boucle infinie
// (WCAG 2.2.2). Avec prefers-reduced-motion, il est affiché directement dans
// son état final, sans animation.
export default function HoloReveal({ children, glowType }) {
  const reduceMotion = useReducedMotion();
  const couleur = glowType ? `var(--type-${glowType})` : "var(--rule-strong)";

  return (
    <div className="relative">
      {/* Halo radial (le flou est un effet lourd, accepté ici : un seul par page). */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${couleur} 0%, transparent 68%)` }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      />

      <div className="relative">{children}</div>
    </div>
  );
}
