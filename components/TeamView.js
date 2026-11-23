"use client";

import Image from "next/image";
import Link from "next/link";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";

// Affiche les 6 emplacements de la sacoche : occupés (avec image, numéro,
// nom, lien vers la fiche et bouton Retirer) ou vides (cadre pointillé).
export default function TeamView({ pokemonList }) {
  const teamIds = useTeamStore((state) => state.teamIds);
  const remove = useTeamStore((state) => state.remove);

  // On construit toujours 6 emplacements, qu'ils soient occupés ou non.
  const emplacements = Array.from({ length: MAX_TEAM_SIZE }, (_, index) => {
    const id = teamIds[index];
    if (id === undefined) {
      return null;
    }
    return pokemonList.find((pokemon) => pokemon.id === id) ?? null;
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {emplacements.map((pokemon, index) =>
        pokemon ? (
          <div
            key={pokemon.id}
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Link href={`/pokemon/${pokemon.id}`} className="flex flex-col items-center gap-2">
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={100}
                height={100}
                className="h-20 w-20 object-contain"
              />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                #{String(pokemon.id).padStart(3, "0")}
              </p>
              <p className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
                {pokemon.name}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => remove(pokemon.id)}
              className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            >
              Retirer
            </button>
          </div>
        ) : (
          <div
            key={`vide-${index}`}
            className="flex min-h-[160px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
          >
            Emplacement libre
          </div>
        )
      )}
    </div>
  );
}
