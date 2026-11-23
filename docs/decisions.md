# Décisions — Pokedex

Une ligne par décision qui engage la suite : `AAAA-MM-JJ — décision — raison`.
Une décision remplacée n'est pas effacée : ajoute « (remplacée le AAAA-MM-JJ) » à la fin de sa ligne.


- 2026-11-23 — Projet Next.js App Router en JavaScript (pas TypeScript), Tailwind CSS, Zustand et Vitest (`npm test` = `vitest run`) — choix de projet d'apprentissage, sans `src/` ni `tsconfig.json`.
- 2026-11-23 — Directive `'use cache'` sur `getPokemonList()` et `getPokemonDetail(id)` dans `lib/pokeapi.js` — compatible `cacheComponents: true` pour garder `/` statique et éviter la pré-génération des 1 025 fiches.
- 2026-11-23 — Page `/pokemon/[id]` non-async enveloppant un enfant async (qui lit `params`) dans `<Suspense>` — conserve un App Shell statique (Partial Prerender) sous `cacheComponents: true`.
- 2026-11-23 — Stores Zustand persistés avec `skipHydration: true` + `partialize`, réhydratés une fois en `useEffect` dans `Header` — évite les erreurs d'hydratation SSR/client liées à la lecture synchrone du `localStorage`.
- 2026-11-23 — Stack UI « Holo Arcade » : `shadcn/ui` Base UI (`--base base --preset nova`, `.jsx`), `lucide-react`, `motion`, `sonner` (`<Toaster />`), polices `Darker_Grotesque` (`--font-display`) et `Rubik` (`--font-sans`) — cohérence visuelle sans autre librairie UI.
- 2026-11-23 — 18 couleurs de type centralisées en variables CSS (`--type-*` / `--type-*-foreground`) dans `app/globals.css` (clair + `.dark`, encre sombre `#14161A` sur les 6 types clairs) — source unique de vérité et contraste WCAG ≥ 4,5:1.
- 2026-11-23 — Transitions via `<ViewTransition>` React natif + `transitionTypes` sur `next/link` (sans flag `experimental.viewTransition`), motif Two-Layer sur la fiche et morph `pokemon-image-{id}` — convention Next.js 16 sans configuration expérimentale.
- 2026-11-23 — Retours d'erreur de la sacoche via toast `sonner` dans `TeamButton` (bannière retirée du `Header`, `lastMessage` conservé dans le store) — évite le double affichage.
- 2026-11-23 — Accessibilité et performances : lien d'évitement `#main-content`, `.pokemon-card` en `content-visibility: auto`, barres de stats animées en `scaleX` uniquement, halo `HoloReveal` en animation d'entrée unique avec `prefers-reduced-motion` — conformité WCAG (dont 2.2.2) et fluidité sur 1 025 cartes.
- 2026-11-23 — `ThemeToggle` utilise `useHasMounted()` basé sur `useSyncExternalStore` — évite le mismatch d'hydratation de `next-themes` et l'erreur ESLint `react-hooks/set-state-in-effect`.
- 2026-11-23 — Noms français dans `lib/data/noms-fr.json` (généré par `scripts/noms-fr.mjs`), exposés en `nameFr` (recherche bilingue sans accents/casse dans `lib/filters.js`, `namesById` passé par `app/layout.js` au `Header`) — zéro appel réseau supplémentaire tout en gardant `name` compatible avec les tests.
- 2026-11-23 — Accent unique rouge Pokédex (`#B3112B` clair / `#8A0E22` sombre) sur `--primary`/`--secondary`/`--accent` ; en `.dark`, `--ring` et `--sidebar-ring` passés à `#FF5C72` — identité unifiée sans violet/cyan et contraste d'anneau de focus 6,21:1 (WCAG ≥ 3:1).
- 2026-11-23 — En-tête fin collant translucide (`backdrop-blur`, bordure basse rouge, logo `PokeBall.js` réutilisable `aria-hidden` par défaut), filtres en pastilles centrées (`aria-pressed` Base UI, pleine opacité), cartes teintées à 32 % avec boutons sous les types et helpers purs dans `lib/format.js` — lisibilité, contraste et séparation présentation/logique.
