"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { Button } from "@/components/ui/button";
import PokemonCard from "@/components/PokemonCard";

// En-tête (« Favoris » + compteur discret) et grille des Pokémon mis en
// favori, avec la même grille responsive que l'index (PokemonGrid).
//
// Hydratation : tant que le store n'a pas lu le localStorage (hasHydrated
// = false), le serveur et le premier rendu client affichent le même
// message de chargement (pas d'erreur d'hydratation). Ensuite seulement on
// choisit entre la grille et l'état vide — ce qui évite de faire clignoter
// l'état vide chez quelqu'un qui a des favoris.
export default function FavoritesList({ pokemonList }) {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  // Gardés dans l'ordre de l'index (par numéro).
  const favoris = pokemonList.filter((pokemon) => favoriteIds.includes(pokemon.id));
  const nombre = hasHydrated ? favoris.length : 0;

  return (
    <section aria-labelledby="titre-favoris">
      {/* En-tête sobre : titre + compteur discret. */}
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h1
            id="titre-favoris"
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Favoris
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tes Pokémon préférés, rangés par numéro, enregistrés dans ce navigateur.
          </p>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span aria-hidden="true">
            <span className={nombre > 0 ? "font-semibold text-primary" : "text-foreground"}>{nombre}</span>
            {" "}/ {pokemonList.length}
          </span>
          <span className="sr-only">
            {hasHydrated ? `${nombre} Pokémon en favori` : "Chargement des favoris"}
          </span>
        </p>
      </header>

      <div className="mt-6">
        {!hasHydrated ? (
          // Avant lecture du localStorage : un message neutre.
          <p className="rounded-2xl bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-soft ring-1 ring-border">
            Chargement de tes favoris…
          </p>
        ) : favoris.length === 0 ? (
          // État vide : doux, avec une action claire.
          <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-soft ring-1 ring-border">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart aria-hidden="true" className="size-6" />
            </span>
            <p className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
              Aucun favori pour l&apos;instant
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Touche le cœur d&apos;une carte dans l&apos;index pour l&apos;ajouter ici.
            </p>
            <Button
              variant="outline"
              render={<Link href="/" />}
              nativeButton={false}
              className="mt-6 min-h-11 rounded-xl px-5"
            >
              Parcourir l&apos;index
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          // Même grille que l'index (components/PokemonGrid.js).
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {favoris.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
