# Pokédex

Une application web qui affiche les 1 025 Pokémon avec leurs illustrations
officielles, grâce à la [PokéAPI](https://pokeapi.co/). Projet de cours,
écrit en JavaScript (pas TypeScript).

## Fonctionnalités

- Grille responsive des 1 025 Pokémon (illustrations officielles)
- Recherche par nom ou par numéro, mise à jour en direct
- Filtres par type (18 types, cliquables, cumulables avec la recherche)
- Fiche détaillée de chaque Pokémon, en français (description, taille,
  poids, statistiques de base, types)
- Favoris persistants (sauvegardés dans le navigateur)
- Sacoche de dresseur limitée à 6 Pokémon maximum, elle aussi persistante

## Stack technique

- [Next.js](https://nextjs.org/) (App Router) + [React](https://react.dev/)
- JavaScript (pas TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) pour les favoris et la sacoche
  (avec persistance dans le `localStorage`)
- [Vitest](https://vitest.dev/) pour les tests
- [PokéAPI](https://pokeapi.co/api/v2) comme source de données (pas de clé
  nécessaire)

## Commandes utiles

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (http://localhost:3000)
npm run dev

# Lancer les tests
npm test

# Vérifier le code avec ESLint
npm run lint

# Construire la version de production
npm run build
```

## Site en ligne

Déployé sur Vercel : [https://pokedex-delta-wine.vercel.app](https://pokedex-delta-wine.vercel.app)
