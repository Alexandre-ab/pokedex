# Commandes du projet (https://github.com/casey/just)
# Lancer `just` seul affiche cette liste.

# Affiche la liste des commandes disponibles
default:
    @just --list

# Installe les dépendances
install:
    npm install

# Lance le serveur de développement sur http://localhost:3000
dev:
    npm run dev

# Lance les tests Vitest
test:
    npm test

# Vérifie le code avec ESLint
lint:
    npm run lint

# Lance les tests puis le lint : vérification complète avant commit
check: test lint

# Construit la version de production
build:
    npm run build

# Lance le serveur de production (après un build)
start:
    npm run start

# Régénère le fichier des noms français depuis PokéAPI
noms-fr:
    node scripts/noms-fr.mjs
