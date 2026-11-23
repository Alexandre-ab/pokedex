## Le projet
Pokédex : appli web qui affiche les 1 025 Pokémon (illustrations officielles), avec recherche, filtres par type, fiches détaillées, favoris et une sacoche d'équipe (6 max). Déployée en ligne. Projet de cours : JavaScript, pas TypeScript.

- Stack : Next.js (App Router) + React, Tailwind CSS, Zustand
- Données : PokéAPI https://pokeapi.co/api/v2 (pas de clé)
- Lancer : npm run dev → http://localhost:3000
- Tester : npm test && npm run lint && npm run build
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

## Équipe (qui fait quoi)
Antigravity dirige, Claude Code code, Codex teste. Le chef envoie ses consignes par Herdr : elles commencent par « Tâche du chef ».
- Antigravity (agy), le chef : découpe, donne les tâches, vérifie, rend compte à l'humain. Il ne modifie aucun fichier.
- Claude Code, le codeur (nom Herdr : codeur) : écrit le code (app/, components/, lib/, store/, config). Il ne modifie pas tests/.
- Codex, le testeur (nom Herdr : testeur) : écrit et lance les tests, dans tests/ uniquement. Il ne corrige jamais le code : il signale le bug au chef.
- Un seul agent modifie les fichiers à la fois.
- Personne ne committe ni ne pousse sans l'accord de l'humain.
- Quand vous répondez au chef, terminez par un bloc RÉSUMÉ : fichiers touchés, résultat, questions.
- Commande de test : npm test

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Mémoire partagée entre agents (obligatoire)

Plusieurs agents travaillent sur ce projet (Claude Code, Codex, Antigravity), souvent en parallèle,
chacun dans son propre worktree Git. Vous ne vous souvenez de rien d'une session à l'autre :
la mémoire commune est dans l'outil MCP **basic-memory**.

Toutes les notes de ce projet vont dans le dossier **`pokedex/`** de basic-memory, et nulle part ailleurs.

### Au démarrage de chaque tâche

1. Cherchez dans basic-memory les notes du dossier `pokedex/passations/` et lisez les 3 plus récentes.
2. Lisez la note `pokedex/decisions` si elle existe.
3. Si une passation concerne votre tâche, reprenez exactement là où elle s'arrête.
   Dites à l'humain, en une ligne, ce que vous avez repris et de quelle passation.

### Pendant la tâche

- Une décision qui engage la suite (choix d'une bibliothèque, format de données, contrainte découverte) :
  ajoutez-la à la note `pokedex/decisions` avec la date, la décision et la raison.
- Ne recopiez pas de code dans la mémoire : citez les chemins de fichiers.

### À la fin de chaque tâche, ou avant de vous arrêter

Écrivez une note de passation dans `pokedex/passations/`,
avec pour titre `AAAA-MM-JJ-HHMM-<agent>-<tâche-en-3-mots>`, et ces rubriques :

- **Besoin** : ce que l'humain a demandé, avec ses mots.
- **Fait** : ce qui marche maintenant, et comment vous l'avez vérifié.
- **Reste à faire** : les prochaines étapes, dans l'ordre.
- **Pour qui** : l'agent conseillé pour la suite (Claude, Codex, Antigravity) ou « n'importe lequel ».
- **Fichiers touchés** : les chemins.
- **Pièges** : ce qui a coincé, ce qu'il ne faut pas refaire.
- **Branche / worktree** : le nom de la branche.

### Règles

- Jamais de secret (mot de passe, clé, token) dans la mémoire.
- Si une note contredit le code, le code a raison : corrigez la note.
- Une information stable, valable pour tout le projet : proposez à l'humain de l'ajouter
  à ce fichier AGENTS.md plutôt que de la laisser en mémoire.

## Équipe (qui fait quoi)

Antigravity dirige, Claude Code code, Codex teste. Le chef envoie ses consignes par Herdr :
elles commencent par « Tâche du chef ».

- **Antigravity (`agy`), le chef** : découpe le travail, donne les tâches, vérifie, rend compte
  à l'humain. Il ne modifie aucun fichier.
- **Claude Code, le codeur** (nom Herdr : `codeur`) : écrit le code de l'application.
  Il ne modifie pas le dossier de tests.
- **Codex, le testeur** (nom Herdr : `testeur`) : écrit et lance les tests, dans le dossier de tests
  uniquement. Il ne corrige jamais le code de l'application : il signale le bug au chef.
- Un seul agent modifie les fichiers à la fois.
- Personne ne committe ni ne pousse sans l'accord de l'humain.
- Quand vous répondez au chef, terminez par un bloc **RÉSUMÉ** : fichiers touchés, résultat, questions.
- Commande de test : celle de la ligne « Tester » de la section « Le projet ».
