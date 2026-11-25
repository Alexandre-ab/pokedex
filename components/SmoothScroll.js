"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";

// ---------------------------------------------------------------------------
// Défilement doux (Lenis) de la vitrine, monté UNIQUEMENT sur la page
// d'accueil. Ce composant n'affiche rien : il ajoute juste une légère
// inertie à la molette. Les autres pages gardent le défilement natif.
//
// Lenis n'est PAS créé (défilement 100 % natif) quand :
// - l'utilisateur préfère moins d'animations (prefers-reduced-motion) ;
// - l'écran est tactile (pointer: coarse) : le doigt garde son inertie native ;
// - le navigateur est en mode « économie de données » (saveData).
//
// Une seule boucle : Lenis est piloté par le planificateur `frame` de motion
// (celui qui anime déjà useScroll et les autres animations de la page),
// au lieu de lancer son propre requestAnimationFrame en parallèle.
// ---------------------------------------------------------------------------
const REQUETE_REDUIT = "(prefers-reduced-motion: reduce)";
const REQUETE_TACTILE = "(pointer: coarse)";

// La page est-elle verrouillée par une fenêtre modale (ex. le tiroir
// « Sacoche ») ? Base UI pose alors overflow hidden sur <html> ou <body>.
function pageVerrouillee() {
  const html = document.documentElement.style;
  const body = document.body.style;
  return html.overflowY === "hidden" || body.overflowY === "hidden" || body.position === "fixed";
}

export default function SmoothScroll() {
  useEffect(() => {
    const reduit = window.matchMedia(REQUETE_REDUIT);
    const tactile = window.matchMedia(REQUETE_TACTILE);
    let lenis = null;

    // Appelée à chaque image par motion : Lenis avance d'un pas.
    function tick({ timestamp }) {
      lenis?.raf(timestamp);
    }

    function demarrer() {
      lenis = new Lenis({
        lerp: 0.1, // inertie légère (docs/STYLE_GUIDE.md, A14)
        autoRaf: false, // c'est motion qui fait tourner la boucle (tick)
        // Ancres (#catalogue, lien d'évitement) : on laisse le navigateur
        // faire (défilement + déplacement du focus) ; Lenis se resynchronise
        // tout seul sur le défilement natif.
        anchors: false,
        // Défilement interne des éléments marqués data-lenis-prevent
        // (Popover des types, tiroir Sacoche) ou défilables (allowNestedScroll).
        allowNestedScroll: true,
        // Si une modale verrouille la page, Lenis ignore la molette : la page
        // derrière ne bouge pas et la modale défile normalement.
        virtualScroll: () => !pageVerrouillee(),
      });
      frame.update(tick, true); // true = garder la boucle active
    }

    function arreter() {
      cancelFrame(tick);
      lenis?.destroy(); // retire ses écouteurs et ses classes sur <html>
      lenis = null;
    }

    // (Ré)évalue les conditions : si l'utilisateur active « réduire les
    // animations » en cours de route, Lenis s'arrête aussitôt.
    function evaluer() {
      const autorise = !reduit.matches && !tactile.matches && !navigator.connection?.saveData;
      if (autorise && !lenis) demarrer();
      if (!autorise && lenis) arreter();
    }

    evaluer();
    reduit.addEventListener("change", evaluer);
    tactile.addEventListener("change", evaluer);

    // Démontage (navigation vers une fiche, /favoris, /sacoche) : on arrête
    // la boucle, on détruit Lenis et on retire nos écouteurs.
    return () => {
      reduit.removeEventListener("change", evaluer);
      tactile.removeEventListener("change", evaluer);
      arreter();
    };
  }, []);

  return null;
}
