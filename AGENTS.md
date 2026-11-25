## Le projet
Pokédex : appli web qui affiche les 1 025 Pokémon (illustrations officielles), avec recherche, filtres par type, fiches détaillées, favoris et une sacoche d'équipe (6 max). Déployée en ligne. Projet de cours : JavaScript, pas TypeScript.

- Stack : Next.js (App Router) + React, Tailwind CSS, Zustand
- Données : PokéAPI https://pokeapi.co/api/v2 (pas de clé)
- Lancer : npm run dev → http://localhost:3000
- Tester : `npm test && npm run lint` (build seulement avant un déploiement)
- Tickets : GitHub Projects (PKX-xx)

## Conventions
- Pages dans app/, composants dans components/ (un par fichier), appels API dans lib/pokeapi.js, stores Zustand dans store/
- Ne garder que les Pokémon d'id 1 à 1025 (l'API renvoie aussi des formes d'id > 10000)
- Images via next/image ; remotePatterns : raw.githubusercontent.com, /PokeAPI/sprites/**
- Favoris et sacoche : stores Zustand avec persist (localStorage), sans erreur d'hydratation
- La limite de 6 Pokémon dans la sacoche vit dans le store, pas dans l'interface
- Style en classes Tailwind uniquement
- Code simple et commenté : c'est un projet d'apprentissage
- Commits en français, préfixés par l'ID du ticket (PKX-02: …)
- UI : shadcn/ui (Base UI) dans components/ui, icônes lucide-react, animations motion ("use client"), transitions de page avec le skill vercel-react-view-transitions, couleurs de type depuis le thème ; pas d'autre librairie d'UI ; effets lourds (WebGL `ogl`, scroll `lenis`) réservés au Hero vitrine de l'accueil et à la fiche détaillée, jamais sur les 1 025 cartes du catalogue. Direction visuelle : Design ergonomique doux (surfaces arrondies, lecture rapide, sans quadrillage).

## Équipe
Antigravity (chef) délègue via T3 Code, Claude Code code, Codex teste.
Mémoire : basic-memory, dossier `pokedex/`. Seul le chef la lit et l'écrit (règles dans le skill chef-t3).
Antigravity, dans T3 Code : pour toute demande de travail sur ce projet, applique le skill `chef-t3`, même sans `$chef-t3`.
- Codeur : app/, components/, lib/, store/, config ; jamais `tests/`.
- Testeur : `tests/` uniquement ; il signale les bugs, il ne les corrige pas.
- Un seul agent modifie les fichiers à la fois. Personne ne committe sans l'accord de l'humain.
- Réponse au chef : finir par RÉSUMÉ (10 lignes max).
- Travail sans chef : lis la dernière passation de `pokedex/passations/` si la tâche la prolonge, et écris-en une de 6 lignes à la fin.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
