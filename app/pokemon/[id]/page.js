import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { parsePokemonId, getPokemonDetail } from "@/lib/pokeapi";
import { TYPE_STYLES } from "@/lib/typeStyles";

// Labels français des statistiques de base, dans l'ordre affiché par l'API.
const STAT_LABELS = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Att. Spé.",
  "special-defense": "Déf. Spé.",
  speed: "Vitesse",
};

// Valeur de base maximale théorique, pour dessiner la barre à l'échelle.
const STAT_MAX = 255;

// La page elle-même ne lit pas "params" directement : ça la rendrait
// dynamique pour tout le monde. On passe la promesse au composant enfant,
// dans un <Suspense>, pour que le reste de la route reste prérendable.
export default function PokemonPage({ params }) {
  return (
    <Suspense fallback={<p className="p-8 text-center">Chargement...</p>}>
      <PokemonDetail paramsPromise={params} />
    </Suspense>
  );
}

async function PokemonDetail({ paramsPromise }) {
  const { id: rawId } = await paramsPromise;
  const id = parsePokemonId(rawId);

  if (id === null) {
    notFound();
  }

  const pokemon = await getPokemonDetail(id);
  const number = String(pokemon.id).padStart(3, "0");

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Retour au Pokédex
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={200}
            height={200}
            className="mx-auto h-40 w-40 object-contain"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            #{number}
          </p>
          <h1 className="text-2xl font-bold capitalize text-zinc-900 dark:text-zinc-50">
            {pokemon.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[type]?.classes ?? "bg-zinc-400 text-white"}`}
              >
                {TYPE_STYLES[type]?.label ?? type}
              </span>
            ))}
          </div>

          {pokemon.description && (
            <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
              {pokemon.description}
            </p>
          )}

          <div className="mt-4 flex justify-center gap-8 text-sm text-zinc-700 dark:text-zinc-300">
            <p>Taille : {pokemon.height} m</p>
            <p>Poids : {pokemon.weight} kg</p>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-left">
            {pokemon.stats.map((stat) => (
              <div key={stat.name}>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>{STAT_LABELS[stat.name] ?? stat.name}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(100, (stat.value / STAT_MAX) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            {pokemon.id > 1 ? (
              <Link
                href={`/pokemon/${pokemon.id - 1}`}
                className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                ← Précédent
              </Link>
            ) : (
              <span />
            )}
            {pokemon.id < 1025 ? (
              <Link
                href={`/pokemon/${pokemon.id + 1}`}
                className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                Suivant →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
