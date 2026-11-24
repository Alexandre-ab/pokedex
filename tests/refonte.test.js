import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readProjectFile = (path) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

const css = readProjectFile('../app/globals.css');
const types = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
];

describe('contrats du design ergonomique doux', () => {
  it('définit les couleurs et couleurs de texte des 18 types en clair et sombre', () => {
    const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    const darkBlock = css.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

    expect(rootBlock).not.toBe('');
    expect(darkBlock).not.toBe('');
    for (const type of types) {
      for (const suffix of ['', '-foreground']) {
        const variable = `--type-${type}${suffix}`;
        expect(rootBlock, `${variable} en clair`).toMatch(new RegExp(`${variable}:\\s*#[\\da-f]{3,8}`, 'i'));
        expect(darkBlock, `${variable} en sombre`).toMatch(new RegExp(`${variable}:\\s*#[\\da-f]{3,8}`, 'i'));
      }
    }
  });

  it('expose les ombres douces et exclut les anciens repères quadrillés', () => {
    expect(css).toMatch(/--shadow-soft:\s*var\(--soft-shadow\)/);
    expect(css).toMatch(/--shadow-float:\s*var\(--float-shadow\)/);
    for (const obsolete of ['bg-millimetre', 'crop-marks', 'ruler-ticks', 'shadow-plate', '--plate-shadow']) {
      expect(css).not.toContain(obsolete);
    }
  });

  it('expose les tokens de surface et de contraste', () => {
    for (const token of ['--paper:', '--paper-deep:', '--ink:', '--vermilion:', '--rule:', '--rule-strong:']) {
      expect(css).toContain(token);
    }
  });

  it('préserve les repères d’accessibilité et de performance CSS', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(css).toMatch(/\.pokemon-card\s*\{[^}]*content-visibility:\s*auto/s);
    for (const file of ['../app/page.js', '../app/favoris/page.js', '../app/sacoche/page.js', '../app/pokemon/[id]/page.js']) {
      expect(readProjectFile(file), file).toMatch(/<main\b[^>]*id="main-content"/);
    }
  });

  it('garde les cartes sans animation motion individuelle', () => {
    expect(readProjectFile('../components/PokemonCard.js')).not.toMatch(/motion\.div/);
  });

  it('garde la fiche Pokémon synchronisée avec Suspense et ViewTransition', () => {
    const page = readProjectFile('../app/pokemon/[id]/page.js');

    expect(page).toMatch(/export default function PokemonPage\(/);
    expect(page).not.toMatch(/export default async function PokemonPage\(/);
    expect(page).toMatch(/<Suspense\b/);
    expect(page).toMatch(/<ViewTransition\b/);
  });

  it('conserve les transitions de vue et le respect des préférences de mouvement', () => {
    for (const file of ['../app/page.js', '../app/favoris/page.js', '../app/sacoche/page.js', '../app/pokemon/[id]/page.js']) {
      expect(readProjectFile(file), file).toMatch(/<ViewTransition\b/);
    }
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('utilise useSyncExternalStore pour éviter une divergence d’hydratation du thème', () => {
    expect(readProjectFile('../components/ThemeToggle.js')).toMatch(/useSyncExternalStore/);
  });
});
