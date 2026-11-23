"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Navigation au clavier sur la fiche : ← Pokémon précédent, → suivant.
// Composant purement comportemental : il n'affiche rien.
export default function PokemonKeyboardNav({ prevId, nextId }) {
  const router = useRouter();

  // On précharge les deux voisins pour que le changement soit quasi instantané.
  useEffect(() => {
    if (prevId) router.prefetch(`/pokemon/${prevId}`);
    if (nextId) router.prefetch(`/pokemon/${nextId}`);
  }, [router, prevId, nextId]);

  useEffect(() => {
    function onKeyDown(event) {
      // Pas de raccourci avec un modificateur ou une touche maintenue.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;

      // On ne vole pas les flèches à un champ de saisie.
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
      }

      // Ni quand un dialogue / tiroir est ouvert.
      if (document.querySelector('[role="dialog"]')) return;

      // "transitionTypes" est ajouté par Next dans la transition de navigation
      // (équivalent à startTransition + addTransitionType) : le CSS sait ainsi
      // dans quel sens faire glisser la carte.
      if (event.key === "ArrowLeft" && prevId) {
        event.preventDefault();
        router.push(`/pokemon/${prevId}`, { transitionTypes: ["nav-back"] });
      } else if (event.key === "ArrowRight" && nextId) {
        event.preventDefault();
        router.push(`/pokemon/${nextId}`, { transitionTypes: ["nav-forward"] });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    // Nettoyage au démontage.
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, prevId, nextId]);

  return null;
}
