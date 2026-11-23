"use client";

import { useTeamStore } from "@/store/team";

// Bouton pour ajouter/retirer un Pokémon de la sacoche.
// On ne désactive jamais le bouton "Ajouter" quand la sacoche est pleine :
// on laisse add(id) être appelé, le store refuse et pose lastMessage, que
// components/Header.js affiche dans sa bannière.
export default function TeamButton({ id }) {
  const hasHydrated = useTeamStore((state) => state.hasHydrated);
  const isInTeam = useTeamStore((state) => state.teamIds.includes(id));
  const add = useTeamStore((state) => state.add);
  const remove = useTeamStore((state) => state.remove);

  // Avant hydratation, on affiche toujours "pas dans la sacoche" pour que
  // le rendu serveur et le premier rendu client soient identiques.
  const estDansLaSacoche = hasHydrated && isInTeam;

  return (
    <button
      type="button"
      onClick={(event) => {
        // On empêche le clic de déclencher le lien de la carte en dessous.
        event.preventDefault();
        event.stopPropagation();
        if (estDansLaSacoche) {
          remove(id);
        } else {
          add(id);
        }
      }}
      className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-zinc-700 shadow dark:bg-zinc-900/80 dark:text-zinc-200"
    >
      {estDansLaSacoche ? "Retirer de la sacoche" : "Ajouter à la sacoche"}
    </button>
  );
}
