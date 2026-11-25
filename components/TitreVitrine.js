"use client";

import { motion, useReducedMotion } from "motion/react";

// ---------------------------------------------------------------------------
// Titre de section de la vitrine (Nuancier, Frise, Records, Catalogue).
//
// Même chorégraphie typographique que le Hero et le Manifeste, en sobre :
//   1. le sur-titre monte un peu et apparaît (450 ms) ;
//   2. le titre monte depuis un masque (overflow-clip) : il est toujours
//      en pleine opacité, c'est le masque qui le révèle (60 ms après) ;
//   3. le mot-clé en Fraunces italique éclot juste après (120 ms plus tard).
// Seuls transform et opacity bougent : animation 100 % GPU.
// L'animation se joue une fois, quand 35 % du bloc entre à l'écran.
//
// prefers-reduced-motion : initial={false}, tout est affiché d'emblée
// dans son état final.
//
// Le masque est sur un <span> DANS le <h2>, pas sur le <h2> lui-même :
// l'anneau de focus du titre (tabIndex -1 sur le catalogue) reste visible.
// ---------------------------------------------------------------------------

// Courbe « sortie douce » partagée avec le Hero.
const EASE = [0.22, 1, 0.36, 1];

// États nommés (variants) : le conteneur déclenche, les enfants suivent.
const surtitreVariants = {
  cache: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

const titreVariants = {
  cache: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.65, ease: EASE, delay: 0.06 } },
};

// Le mot-clé ne touche pas à l'opacité : il grandit et se pose doucement.
const motCleVariants = {
  cache: { y: "0.2em", scale: 0.94 },
  visible: { y: "0em", scale: 1, transition: { duration: 0.55, ease: EASE, delay: 0.18 } },
};

export default function TitreVitrine({
  id,
  surtitre,
  debut,
  motCle,
  fin = ".",
  tabIndex,
  className,
  surtitreClassName = "text-muted-foreground",
  titreClassName = "text-foreground",
}) {
  const reduit = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduit ? false : "cache"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      <motion.p
        variants={surtitreVariants}
        className={`text-index tracking-[0.04em] uppercase ${surtitreClassName}`}
      >
        {surtitre}
      </motion.p>

      <h2 id={id} tabIndex={tabIndex} className={`titre-section mt-3 ${titreClassName}`}>
        {/* Masque : pb pour ne pas couper les jambages (g, p, ç). */}
        <span className="block overflow-clip pb-[0.1em]">
          <motion.span variants={titreVariants} className="block">
            {debut}{" "}
            <motion.span variants={motCleVariants} className="mot-cle inline-block origin-bottom-left">
              {motCle}
            </motion.span>
            {fin}
          </motion.span>
        </span>
      </h2>
    </motion.div>
  );
}
