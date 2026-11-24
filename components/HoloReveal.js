"use client";

import { motion, useReducedMotion } from "motion/react";

// Halo "Holo Arcade" derrière l'illustration, dans la couleur du type fourni
// (glowType). Les enfants, eux, ne sont PAS animés ici : leur entrée (et le
// morph de l'image) est déjà gérée par <ViewTransition>, donc pas de double
// animation superposée.
//
// Le halo apparaît en un seul fondu doux, une fois, puis reste fixe : pas de
// boucle infinie (WCAG 2.2.2 interdit une animation décorative en boucle sans
// moyen de l'arrêter). Avec prefers-reduced-motion, il apparaît directement
// à son opacité finale, sans animation.
export default function HoloReveal({ children, glowType }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {glowType && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, var(--type-${glowType}) 0%, transparent 70%)`,
          }}
          initial={{ opacity: reduceMotion ? 0.55 : 0 }}
          animate={{ opacity: 0.55 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
