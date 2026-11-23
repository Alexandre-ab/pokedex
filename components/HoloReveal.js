"use client";

import { motion, useReducedMotion } from "motion/react";

// Révélation "façon carte Holo Arcade" : apparition en un seul mouvement
// (fondu + léger zoom), une fois, au montage. Avec prefers-reduced-motion,
// le contenu apparaît directement, sans animation.
//
// Avec "glowType", ajoute en plus un halo derrière les enfants, dans la
// couleur du type fourni (ex. autour de l'illustration de la fiche). Le
// halo s'installe une seule fois puis reste fixe : pas de boucle infinie
// (WCAG 2.2.2 interdit une animation décorative en boucle sans moyen de
// l'arrêter). Avec prefers-reduced-motion, le halo apparaît directement à
// sa taille/opacité finale, sans animation du tout.
export default function HoloReveal({ children, glowType }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative"
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
    >
      {glowType && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, var(--type-${glowType}) 0%, transparent 70%)`,
          }}
          initial={reduceMotion ? { opacity: 0.55, scale: 1 } : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
