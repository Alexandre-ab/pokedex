"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Plus } from "lucide-react";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { Badge } from "@/components/ui/badge";

// Emplacement occupé : illustration sur fond teinté au type, nom, types, lien
// vers la fiche, puis le bouton Retirer. Le lien et le bouton sont frères,
// jamais imbriqués.
function EmplacementOccupe({ pokemon, rang, onRetirer }) {
  const nom = pokemon.nameFr ?? pokemon.name;
  const premierType = pokemon.types[0] ?? "normal";
  const couleurType = `var(--type-${premierType})`;

  return (
    <article className="group flex flex-col rounded-2xl bg-card p-3 shadow-soft dark:ring-1 dark:ring-border">
      <Link
        href={`/pokemon/${pokemon.id}`}
        transitionTypes={["nav-forward"]}
        aria-label={`Emplacement ${rang} : ${nom}, voir la fiche`}
        className="flex flex-1 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {/* Illustration : même morph que sur les cartes de l'index. */}
        <span
          className="flex size-24 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklch, ${couleurType} 12%, var(--card))` }}
        >
          <ViewTransition name={`pokemon-image-${pokemon.id}`} share="pokemon-image-morph">
            <Image
              src={pokemon.image}
              alt=""
              width={96}
              height={96}
              className="size-20 object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
            />
          </ViewTransition>
        </span>

        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="text-index text-muted-foreground">
            {rang} · #{String(pokemon.id).padStart(4, "0")}
          </span>
          <span className="truncate font-heading text-xl leading-tight font-semibold tracking-tight text-foreground">
            {nom}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => (
              <Badge
                key={type}
                className={`h-6 rounded-full px-2.5 text-xs font-medium ${
                  TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"
                }`}
              >
                {TYPE_STYLES[type]?.label ?? type}
              </Badge>
            ))}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
            Voir la fiche
            <ArrowRight aria-hidden="true" className="size-3" />
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={onRetirer}
        aria-label={`Retirer ${nom} de la sacoche`}
        className="mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-accent/60 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X aria-hidden="true" className="size-4" />
        Retirer
      </button>
    </article>
  );
}

// Emplacement libre : bordure pointillée arrondie qui invite à ajouter un
// Pokémon depuis l'index.
function EmplacementLibre({ rang }) {
  return (
    <Link
      href="/#catalogue"
      className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rule-strong px-4 py-6 text-center text-muted-foreground hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Plus aria-hidden="true" className="size-5" />
      </span>
      <span className="text-sm font-medium">
        Emplacement {rang} libre
        <span className="sr-only"> : choisir un Pokémon dans l&apos;index</span>
      </span>
      <span aria-hidden="true" className="text-xs">Ajouter depuis l&apos;index</span>
    </Link>
  );
}

// Sacoche : en-tête avec compteur X / 6 et jauge, les 6 emplacements (dans
// l'ordre de la sacoche), puis la synthèse des types de l'équipe.
//
// Hydratation : avant la lecture du localStorage, teamIds vaut [] côté
// serveur comme côté client (store/team.js) : le premier rendu est
// identique des deux côtés, puis les emplacements se remplissent.
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
  const membres = emplacements.filter(Boolean);

  // Types présents dans l'équipe, avec le nombre de membres de chaque type
  // (dans l'ordre de lib/typeStyles.js).
  const typesEquipe = Object.keys(TYPE_STYLES)
    .map((type) => ({
      type,
      nombre: membres.filter((pokemon) => pokemon.types.includes(type)).length,
    }))
    .filter((entree) => entree.nombre > 0);

  return (
    <section aria-labelledby="titre-sacoche">
      {/* En-tête : titre, compteur X / 6 et jauge douce. */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1
            id="titre-sacoche"
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Ma sacoche
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ton équipe de {MAX_TEAM_SIZE} Pokémon au plus, enregistrée dans ce navigateur.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Jauge : un segment arrondi par emplacement (décorative). */}
          <span aria-hidden="true" className="flex gap-1.5">
            {emplacements.map((pokemon, index) => (
              <span
                key={index}
                className={`h-2 w-6 rounded-full ${pokemon ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </span>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span aria-hidden="true">
              <span className="font-semibold text-foreground">{membres.length}</span> / {MAX_TEAM_SIZE}
            </span>
            <span className="sr-only">
              {membres.length} emplacement{membres.length > 1 ? "s" : ""} occupé
              {membres.length > 1 ? "s" : ""} sur {MAX_TEAM_SIZE}
            </span>
          </p>
        </div>
      </header>

      {/* Les 6 emplacements. */}
      <ol aria-label="Emplacements de la sacoche" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {emplacements.map((pokemon, index) => {
          const rang = String(index + 1).padStart(2, "0");
          return (
            <li key={pokemon ? pokemon.id : `libre-${index}`} className="flex flex-col [&>*]:flex-1">
              {pokemon ? (
                <EmplacementOccupe pokemon={pokemon} rang={rang} onRetirer={() => remove(pokemon.id)} />
              ) : (
                <EmplacementLibre rang={rang} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Synthèse des types de l'équipe. */}
      <div className="mt-8 rounded-2xl bg-card p-4 shadow-soft dark:ring-1 dark:ring-border sm:p-5">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Types de l&apos;équipe</h2>
        {typesEquipe.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoute des Pokémon pour voir les types couverts par ton équipe.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {typesEquipe.map(({ type, nombre }) => (
              <li key={type}>
                <Badge
                  className={`h-7 rounded-full px-3 text-sm font-medium ${
                    TYPE_STYLES[type]?.classes ?? "bg-type-normal text-type-normal-foreground"
                  }`}
                >
                  {TYPE_STYLES[type]?.label ?? type}
                  <span className="ml-1 opacity-70">×{nombre}</span>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
