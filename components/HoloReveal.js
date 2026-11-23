"use client";

import { motion, useReducedMotion } from "motion/react";

// Révélation "façon carte Holo Arcade" : la fiche apparaît en un seul
// mouvement (fondu + léger zoom), une fois, au montage. Avec
// prefers-reduced-motion, le contenu apparaît directement, sans animation.
export default function HoloReveal({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
