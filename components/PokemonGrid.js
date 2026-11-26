"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";
import { searchPokemon, filterByType } from "@/lib/filters";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { EVENEMENT_CHOIX_TYPE, EVENEMENT_FOCUS_RECHERCHE } from "@/lib/vitrine";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover";
import PokemonCard from "@/components/PokemonCard";

// Nombre sur N chiffres pour les compteurs mono : 25 -> "0025".
function pad(nombre, chiffres = 4) {
  return String(nombre).padStart(chiffres, "0");
}

// Grille des Pokémon avec une barre arrondie : recherche (nom ou numéro),
// filtre par type (Popover) et compteur discret des Pokémon affichés.
export default function PokemonGrid({ pokemonList, types, typeMap }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  // Ouverture du filtre de type (contrôlée pour le refermer après un choix).
  const [open, setOpen] = useState(false);
  // Pour remettre le curseur dans le champ après "Effacer la recherche".
  const champRef = useRef(null);

  // Le nuancier des types de la vitrine envoie « pokedex:select-type » :
  // on pré-sélectionne ce type et on vide la recherche (sinon le résultat
  // pourrait être vide). Événement du navigateur : pas d'état partagé ni
  // de paramètre d'URL, la page d'accueil reste statique.
  useEffect(() => {
    function surChoixType(evenement) {
      const type = evenement.detail?.type;
      if (!typeMap[type]) return; // type inconnu : on ignore
      setSelectedType(type);
      setQuery("");
      setOpen(false);
    }
    window.addEventListener(EVENEMENT_CHOIX_TYPE, surChoixType);
    return () => window.removeEventListener(EVENEMENT_CHOIX_TYPE, surChoixType);
  }, [typeMap]);

  // Deux façons d'aller directement à la recherche :
  // - le bouton loupe de la navbar envoie « pokedex:focus-search » ;
  // - la touche « / » du clavier (raccourci classique des sites web).
  // Dans les deux cas : on remonte en douceur jusqu'au catalogue, puis on
  // place le curseur dans le champ (preventScroll : pas de 2e saut).
  useEffect(() => {
    function allerALaRecherche() {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      document.getElementById("catalogue")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      champRef.current?.focus({ preventScroll: true });
    }

    // Vrai si l'utilisateur est déjà en train d'écrire quelque part :
    // dans ce cas, « / » doit rester un simple caractère.
    function saisieEnCours() {
      const element = document.activeElement;
      if (!element) return false;
      const balise = element.tagName;
      return (
        balise === "INPUT" ||
        balise === "TEXTAREA" ||
        balise === "SELECT" ||
        element.isContentEditable
      );
    }

    function surTouche(event) {
      if (event.key !== "/") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (saisieEnCours()) return;
      event.preventDefault(); // n'écrit pas « / » dans le champ
      allerALaRecherche();
    }

    window.addEventListener(EVENEMENT_FOCUS_RECHERCHE, allerALaRecherche);
    window.addEventListener("keydown", surTouche);
    return () => {
      window.removeEventListener(EVENEMENT_FOCUS_RECHERCHE, allerALaRecherche);
      window.removeEventListener("keydown", surTouche);
    };
  }, []);

  // Nom français d'un type (repli sur l'identifiant de l'API).
  const typeLabel = (type) => TYPE_STYLES[type]?.label ?? type;

  // Sélectionne (ou efface avec null) un type, puis referme le filtre.
  const choisirType = (type) => {
    setSelectedType(type);
    setOpen(false);
  };

  const effacerRecherche = () => {
    setQuery("");
    champRef.current?.focus();
  };

  const toutEffacer = () => {
    setQuery("");
    setSelectedType(null);
  };

  // On filtre d'abord par type, puis par texte recherché.
  const filteredByType = filterByType(pokemonList, typeMap, selectedType);
  const filteredList = searchPokemon(filteredByType, query);

  // Compteur annoncé aux lecteurs d'écran à chaque changement.
  const rechercheActive = query.trim() !== "";
  const aucunFiltreActif = !rechercheActive && !selectedType;
  const compteurTexte = aucunFiltreActif
    ? `${pokemonList.length} Pokémon`
    : `${filteredList.length} résultat${filteredList.length > 1 ? "s" : ""}`;

  // Phrase de l'état vide : dit précisément ce qui ne donne rien.
  let detailVide = "";
  if (rechercheActive && selectedType) {
    detailVide = `Aucun Pokémon de type ${typeLabel(selectedType)} ne correspond à « ${query.trim()} ».`;
  } else if (rechercheActive) {
    detailVide = `Aucun nom ni numéro ne correspond à « ${query.trim()} ». Les numéros vont de 1 à 1025.`;
  } else if (selectedType) {
    detailVide = `Aucun Pokémon de type ${typeLabel(selectedType)} dans l'index.`;
  }

  return (
    <div>
      {/* ============ Barre de recherche (en haut du catalogue) ============ */}
      {/* Posée naturellement dans le flux (non collante) : elle ne recouvre
          jamais les cartes quand on descend. Pour y revenir d'un clic :
          bouton loupe de la navbar, ou touche « / » (voir plus haut). */}
      <div className="pt-3 pb-6 sm:pt-0">
        <div
          role="search"
          className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-2 shadow-soft dark:ring-1 dark:ring-border sm:flex-nowrap lg:mx-auto lg:max-w-3xl lg:rounded-full lg:p-1.5"
        >
          {/* --- Champ de recherche --- */}
          <label htmlFor="pokemon-search" className="sr-only">
            Rechercher un Pokémon par nom ou par numéro
          </label>
          <div className="relative flex min-w-0 basis-full items-center sm:flex-1 sm:basis-auto">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
            />
            <Input
              ref={champRef}
              id="pokemon-search"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom ou numéro, ex. Pikachu, 25"
              className="min-h-11 flex-1 rounded-xl border border-input lg:rounded-full bg-background pr-12 pl-10 text-base shadow-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
            />
            {rechercheActive && (
              <button
                type="button"
                onClick={effacerRecherche}
                aria-label="Effacer la recherche"
                className="absolute right-0 flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:rounded-full hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* --- Type + compteur (2e ligne sur mobile, même ligne dès sm) --- */}
          <div className="flex flex-1 items-center gap-2 sm:flex-none">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    className="min-h-11 gap-2 rounded-2xl bg-accent/60 px-4 lg:rounded-full text-sm hover:bg-accent aria-expanded:bg-accent"
                  />
                }
                aria-label={
                  selectedType
                    ? `Filtre de type : ${typeLabel(selectedType)}`
                    : "Filtrer par type"
                }
              >
                {/* Pastille : couleur du type actif, ou cercle vide. */}
                <span
                  aria-hidden="true"
                  className={`size-3 shrink-0 rounded-full ${selectedType ? "" : "border border-dashed border-rule-strong"}`}
                  style={selectedType ? { backgroundColor: `var(--type-${selectedType})` } : undefined}
                />
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {selectedType ? typeLabel(selectedType) : "Tous"}
                </span>
                <ChevronDown aria-hidden="true" className="text-muted-foreground" />
              </PopoverTrigger>

              {/* Filtre : 18 types en grille 3 × 6, pastilles arrondies
                  (point de couleur + nom + nombre de Pokémon). */}
              <PopoverContent data-lenis-prevent className="w-[20.5rem] max-w-[calc(100vw-2rem)] gap-3 p-4">
                <div className="flex min-h-6 items-center justify-between">
                  <PopoverTitle className="text-sm font-semibold">
                    Filtrer par type
                  </PopoverTitle>
                  {selectedType && (
                    <button
                      type="button"
                      onClick={() => choisirType(null)}
                      className="rounded-md px-1 text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {types.map((type) => {
                    const actif = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => choisirType(actif ? null : type)}
                        className="group/teinte flex min-h-11 flex-col items-start justify-center gap-0.5 rounded-xl bg-accent/60 px-2.5 py-1.5 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-foreground aria-pressed:text-background"
                      >
                        <span className="flex w-full items-center gap-1.5">
                          {/* Point de couleur (décoratif) ; coche si actif. */}
                          <span
                            aria-hidden="true"
                            className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: `var(--type-${type})`,
                              color: `var(--type-${type}-foreground)`,
                            }}
                          >
                            {actif && <Check className="size-2.5" strokeWidth={4} />}
                          </span>
                          <span className="truncate text-xs font-medium">{typeLabel(type)}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="pl-5 font-mono text-[0.625rem] text-muted-foreground tabular-nums group-aria-pressed/teinte:text-background/70"
                        >
                          {pad(typeMap[type]?.length ?? 0, 3)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Effacer le filtre en 1 clic, sans rouvrir la liste. */}
            {selectedType && (
              <Button
                variant="ghost"
                className="size-11 rounded-2xl hover:bg-accent"
                aria-label="Effacer le filtre de type"
                onClick={() => setSelectedType(null)}
              >
                <X aria-hidden="true" />
              </Button>
            )}

            {/* Compteur discret : affichés / total. */}
            <p aria-live="polite" className="ml-auto px-2 text-sm whitespace-nowrap">
              <span aria-hidden="true">
                <span className={aucunFiltreActif ? "text-foreground" : "font-semibold text-primary"}>
                  {filteredList.length}
                </span>
                <span className="text-muted-foreground"> / {pokemonList.length}</span>
              </span>
              <span className="sr-only">{compteurTexte}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ============ Résultats ============ */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-soft dark:ring-1 dark:ring-border">
          <p className="font-heading text-2xl font-bold tracking-tight">
            Aucun Pokémon trouvé
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{detailVide}</p>
          <Button variant="outline" onClick={toutEffacer} className="mt-6 min-h-11 rounded-xl px-5">
            Tout effacer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}
