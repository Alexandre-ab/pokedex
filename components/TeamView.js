"use client";

import Image from "next/image";
import Link from "next/link";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
          <Card key={pokemon.id} className="items-center gap-2 p-3 text-center">
            <Link
              href={`/pokemon/${pokemon.id}`}
              className="flex flex-col items-center gap-2"
            >
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                width={100}
                height={100}
                className="h-20 w-20 object-contain"
              />
              <p className="text-sm text-muted-foreground">
                #{String(pokemon.id).padStart(3, "0")}
              </p>
              <p className="font-heading text-sm font-semibold capitalize text-foreground">
                {pokemon.name}
              </p>
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => remove(pokemon.id)}
            >
              Retirer
            </Button>
          </Card>
        ) : (
          <div
            key={`vide-${index}`}
            className="flex min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-border text-center text-sm text-muted-foreground"
          >
            Emplacement libre
          </div>
        )
      )}
    </div>
  );
}
