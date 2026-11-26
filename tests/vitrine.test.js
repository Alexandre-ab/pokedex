import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SPECIMENS_VITRINE,
  GENERATIONS,
  especesGeneration,
  trouverGeneration,
  illustrationChromatique,
  illustrationNormale,
  numeroSurQuatre,
  separerMilliers,
  EVENEMENT_CHOIX_TYPE,
  compterTypes,
  RECORDS_VITRINE,
  valeurRecord,
  formaterRecord,
  EVENEMENT_FOCUS_RECHERCHE,
} from '../lib/vitrine.js';

const source = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

describe('données de la vitrine Lentille', () => {
  it('garde les quatre spécimens fixes dans l’ordre prévu', () => {
    expect(SPECIMENS_VITRINE).toEqual([6, 130, 197, 384]);
  });

  it('construit les URLs officielles normales et chromatiques PokéAPI', () => {
    const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
    expect(illustrationNormale(6)).toBe(`${base}/6.png`);
    expect(illustrationChromatique(130)).toBe(`${base}/shiny/130.png`);
  });

  it('formate le numéro sur quatre chiffres et les milliers en français', () => {
    expect(numeroSurQuatre(6)).toBe('0006');
    expect(numeroSurQuatre(1025)).toBe('1025');
    expect(separerMilliers(1025)).toBe('1 025');
    expect(separerMilliers(1000000)).toBe('1 000 000');
  });
});

describe('contrats du Hero Lentille', () => {
  const hero = source('../components/HeroLentille.js');
  const canvas = source('../components/HeroLentilleCanvas.js');

  it('ne force pas min-h-screen et ne duplique pas les transitions des illustrations', () => {
    expect(hero).not.toContain('min-h-screen');
    expect(hero).not.toMatch(/ViewTransition\s+name=["']pokemon-image-/);
  });

  it('marque le motif SVG de fond comme décoratif et inaccessible au focus', () => {
    expect(hero).toMatch(/<svg\s+aria-hidden="true"\s+focusable="false"[\s\S]*?<\/svg>/);
  });

  it('charge le canvas dynamiquement sans SSR et borne le DPR', () => {
    expect(hero).toMatch(/dynamic\([\s\S]*?HeroLentilleCanvas[\s\S]*?ssr:\s*false/);
    expect(canvas).toContain('image.crossOrigin = "anonymous"');
    expect(canvas).toMatch(/dpr:\s*Math\.min\([^,]+,\s*2\)/);
  });

  it('utilise un tableau JavaScript pour uTrace', () => {
    expect(canvas).toMatch(/uTrace\s*:\s*\{[^}]*value\s*:\s*new Array\(10\)\.fill\(0\)/s);
    expect(canvas).not.toMatch(/uTrace\s*:\s*\{[^}]*value\s*:\s*new Float32Array/s);
  });

  it('suspend le rendu hors écran ou lorsque l’onglet est masqué et libère WebGL', () => {
    expect(canvas).toContain('new IntersectionObserver');
    expect(canvas).toContain('document.addEventListener("visibilitychange"');
    expect(canvas).toContain('cancelAnimationFrame(');
    expect(canvas).toContain('loseContext()');
  });

  it('prévoit les replis d’animation et le contrôle de pause accessible', () => {
    expect(hero).toContain('prefers-reduced-motion: reduce');
    expect(hero).toContain('navigator.connection?.saveData');
    expect(hero).toContain('illustrationChromatique(specimen.id)');
    expect(hero).toMatch(/aria-label=\{enPause \? "Reprendre la lentille" : "Mettre la lentille en pause"\}/);
    expect(hero).toMatch(/aria-label=\{enPause \? "Reprendre la lentille" : "Mettre la lentille en pause"\}[\s\S]*?onClick=\{\(\) => setEnPause[\s\S]*?className=/);
  });
});

describe('données des générations', () => {
  it('couvre exactement les numéros 1 à 1025 sans trou ni chevauchement', () => {
    expect(GENERATIONS).toHaveLength(9);
    expect(GENERATIONS[0].debut).toBe(1);
    expect(GENERATIONS.at(-1).fin).toBe(1025);
    GENERATIONS.forEach((generation, index) => {
      expect(generation.numero).toBe(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][index]);
      expect(generation.especes ?? especesGeneration(generation)).toBe(generation.fin - generation.debut + 1);
      expect(generation.starters).toHaveLength(3);
      if (index > 0) expect(generation.debut).toBe(GENERATIONS[index - 1].fin + 1);
    });
    expect(GENERATIONS.reduce((total, generation) => total + especesGeneration(generation), 0)).toBe(1025);
  });

  it('retrouve la génération, y compris la borne supérieure', () => {
    expect(trouverGeneration(1)).toBe(GENERATIONS[0]);
    expect(trouverGeneration(151)).toBe(GENERATIONS[0]);
    expect(trouverGeneration(152)).toBe(GENERATIONS[1]);
    expect(trouverGeneration(1025)).toBe(GENERATIONS[8]);
    expect(trouverGeneration(1026)).toBe(GENERATIONS[8]);
  });
});

describe('contrats des sections animées et de navigation', () => {
  const smooth = source('../components/SmoothScroll.js');
  const manifeste = source('../components/VitrineManifeste.js');
  const frise = source('../components/VitrineFriseGenerations.js');

  it('désactive Lenis selon les préférences et nettoie la frame et l’instance', () => {
    expect(smooth).toContain('(prefers-reduced-motion: reduce)');
    expect(smooth).toContain('(pointer: coarse)');
    expect(smooth).toContain('navigator.connection?.saveData');
    expect(smooth).toContain('cancelFrame(tick)');
    expect(smooth).toContain('lenis?.destroy()');
    expect(smooth).toContain('frame.update(tick, true)');
  });

  it('garde le texte du manifeste visible et réduit son animation', () => {
    expect(manifeste).not.toContain('opacity: 0.28');
    expect(manifeste).toContain('useReducedMotion');
    expect(manifeste).toContain('reduit ? 1 : scrollYProgress');
  });

  it('utilise une piste native en mode non épinglé et évite les transitions image partagées', () => {
    expect(frise).toContain('overflow-x-auto');
    expect(frise).toContain('const epinglee = large && !reduit');
    expect(frise).not.toMatch(/ViewTransition\s+name=["']pokemon-image-/);
    expect(frise).not.toContain('pokemon-image-');
  });

  it('préserve le défilement des composants modaux et les liens vers le catalogue', () => {
    for (const file of ['../components/Header.js', '../components/PokemonGrid.js']) {
      expect(source(file)).toContain('data-lenis-prevent');
    }
    for (const file of ['../app/pokemon/[id]/page.js', '../components/TeamView.js', '../components/FavoritesList.js']) {
      expect(source(file)).toContain('/#catalogue');
    }
  });
});

describe('contrats de la page d’accueil et de navigation', () => {
  const css = source('../app/globals.css');
  const page = source('../app/page.js');
  const header = source('../components/Header.js');

  it('expose l’ancre catalogue et les tokens de la vitrine', () => {
    expect(page).toContain('id="catalogue"');
    for (const token of ['--vitrine-nuit:', '--vitrine-abysse:', '--vitrine-os:', '--vitrine-brume:', '--vitrine-filet:']) {
      expect(css).toContain(token);
    }
  });

  it('déclare les masques compatibles pour la carte-oeillet', () => {
    const carteOeillet = css.match(/@utility\s+carte-oeillet\s*\{([^}]*)\}/s);
    expect(carteOeillet).not.toBeNull();
    expect(carteOeillet?.[1]).toMatch(/-webkit-mask-image\s*:/);
    expect(carteOeillet?.[1]).toMatch(/(?<!-webkit-)mask-image\s*:/);
  });

  it('garde usePathname sous Suspense dans le Header', () => {
    expect(header).toMatch(/<Suspense\b[\s\S]*?HeaderAvecChemin[\s\S]*?<\/Suspense>/);
    expect(header).toMatch(/function HeaderAvecChemin\s*\([^)]*\)\s*\{[\s\S]*?usePathname\(\)/);
    expect(header).toMatch(/export default function Header\s*\([^)]*\)\s*\{\s*return\s*\(\s*<Suspense\b[\s\S]*?<HeaderAvecChemin[\s\S]*?<\/Suspense>/);
  });

  it('compacte la navbar avec un listener scroll passif, nettoyé au démontage', () => {
    expect(header).toMatch(/addEventListener\(\s*["']scroll["']\s*,\s*verifier\s*,\s*\{\s*passive:\s*true\s*\}\s*\)/);
    expect(header).toMatch(/removeEventListener\(\s*["']scroll["']\s*,\s*verifier\s*\)/);
    expect(header).toMatch(/return\s*\(\)\s*=>\s*\{[\s\S]*?removeEventListener\(\s*["']scroll["']\s*,\s*verifier\s*\)/);
  });

  it('utilise deux seuils distincts pour l’hystérésis et évite les effets visuels demandés', () => {
    expect(header).toMatch(/const SEUIL_COMPACT\s*=\s*(\d+)/);
    expect(header).toMatch(/const SEUIL_LARGE\s*=\s*(\d+)/);
    const seuilCompact = Number(header.match(/const SEUIL_COMPACT\s*=\s*(\d+)/)?.[1]);
    const seuilLarge = Number(header.match(/const SEUIL_LARGE\s*=\s*(\d+)/)?.[1]);
    expect(seuilCompact).toBeGreaterThan(seuilLarge);
    expect(header).not.toContain('backdrop-blur');
    expect(header).not.toContain('ring-ring/50');
  });

  it('décale le contenu sous la navbar haute sur desktop', () => {
    const layout = source('../app/layout.js');
    expect(layout).toContain('lg:pt-16');
    expect(layout).not.toContain('lg:pl-rail');
  });

  it('garde la recherche non sticky et permet de la focaliser par événement ou raccourci', () => {
    const grid = source('../components/PokemonGrid.js');
    expect(grid).not.toMatch(/className=["'`][^"'`]*\bsticky\b/);
    expect(grid).toContain('window.addEventListener(EVENEMENT_FOCUS_RECHERCHE, allerALaRecherche)');
    expect(grid).toContain('window.removeEventListener(EVENEMENT_FOCUS_RECHERCHE, allerALaRecherche)');
    expect(grid).toContain('window.addEventListener("keydown", surTouche)');
    expect(grid).toContain('window.removeEventListener("keydown", surTouche)');
    expect(grid).toContain('if (event.key !== "/") return');
    expect(grid).toContain('if (saisieEnCours()) return');
    expect(EVENEMENT_FOCUS_RECHERCHE).toBe('pokedex:focus-search');
    expect(source('../lib/vitrine.js')).toContain('export const EVENEMENT_FOCUS_RECHERCHE = "pokedex:focus-search"');
    expect(source('../components/Header.js')).toMatch(/aria-label="Rechercher un Pokémon"/);
    expect(source('../components/Header.js')).toContain('window.dispatchEvent(new CustomEvent(EVENEMENT_FOCUS_RECHERCHE))');
    expect(source('../components/Header.js')).toContain('router.push("/#catalogue")');
    expect(source('../components/VitrineFriseGenerations.js')).toContain('lg:pt-20');
    expect(page).toContain('lg:scroll-mt-20');
  });

  it('préserve les principaux contrats d’accessibilité et transitions', () => {
    expect(page).toMatch(/<main\b[^>]*id="main-content"/);
    expect(page).toMatch(/<ViewTransition\b/);
    expect(header).toContain('/#catalogue');
    expect(source('../app/layout.js')).toContain('<Header');
  });
});

describe('nuancier des types et records', () => {
  const manifeste = source('../components/VitrineManifeste.js');
  const nuancier = source('../components/VitrineNuancierTypes.js');
  const titreVitrine = source('../components/TitreVitrine.js');
  const frise = source('../components/VitrineFriseGenerations.js');
  const records = source('../components/VitrineRecords.js');
  const grid = source('../components/PokemonGrid.js');
  const page = source('../app/page.js');

  it('valide les records, leurs identifiants, les mesures et les formats', () => {
    expect(RECORDS_VITRINE.length).toBeGreaterThan(0);
    const ids = RECORDS_VITRINE.map(({ id }) => id);
    expect(ids.every((id) => Number.isInteger(id) && id >= 1 && id <= 1025)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    for (const record of RECORDS_VITRINE) {
      expect(record.mesure).toBeTruthy();
      expect(record.titre).toBeTruthy();
      if (record.exAequo) expect(record.exAequo.every((id) => id >= 1 && id <= 1025)).toBe(true);
    }
    expect(valeurRecord({ height: 20, weight: 999.9, stats: [{ name: 'hp', value: 255 }, { name: 'speed', value: 10 }] }, 'total')).toBe(265);
    expect(valeurRecord({ height: 20, weight: 999.9, stats: [{ name: 'hp', value: 255 }] }, 'hp')).toBe(255);
    expect(formaterRecord(999.9, 'weight')).toEqual({ nombre: '999,9', unite: 'kg' });
    expect(formaterRecord(720, 'total')).toEqual({ nombre: '720', unite: '' });
  });

  it('compte et trie les types avec un ordre stable en cas d’égalité', () => {
    expect(compterTypes(['water', 'fire', 'grass', 'electric'], {
      water: [1, 2], fire: [3], grass: [4], electric: [5],
    })).toEqual([
      { type: 'water', nombre: 2 },
      { type: 'electric', nombre: 1 },
      { type: 'fire', nombre: 1 },
      { type: 'grass', nombre: 1 },
    ]);
    expect(EVENEMENT_CHOIX_TYPE).toBe('pokedex:select-type');
  });

  it('émet le choix de type, respecte reduced motion et dimensionne les cibles tactiles', () => {
    expect(nuancier).toContain('window.dispatchEvent(new CustomEvent(EVENEMENT_CHOIX_TYPE');
    expect(nuancier).toContain('useReducedMotion');
    expect(nuancier).toContain('behavior: reduit ? "auto" : "smooth"');
    expect(nuancier).toContain('min-h-11');
    expect(nuancier).toContain('comptes.map');
  });

  it('écoute puis retire le listener du catalogue au démontage', () => {
    expect(grid).toContain('window.addEventListener(EVENEMENT_CHOIX_TYPE, surChoixType)');
    expect(grid).toContain('window.removeEventListener(EVENEMENT_CHOIX_TYPE, surChoixType)');
    expect(grid).toContain('if (!typeMap[type]) return');
    expect(grid).toContain('setSelectedType(type)');
    expect(grid).toContain('setQuery("")');
  });

  it('garde les records en composant serveur, sans doublon de transition image', () => {
    expect(records).not.toMatch(/^\s*["']use client["']/);
    expect(records).not.toContain('pokemon-image-');
    expect(records).toContain('records.map');
    expect(records).toContain('aria-labelledby="titre-records"');
  });

  it('respecte le contrat du titre animé et conserve son masque interne', () => {
    expect(titreVitrine).toContain('useReducedMotion');
    expect(titreVitrine).toMatch(/initial=\{reduit\s*\?\s*false\s*:\s*"cache"\}/);
    expect(titreVitrine).toMatch(/viewport=\{\{\s*once:\s*true\s*,\s*amount:\s*0\.35\s*\}\}/);
    expect(titreVitrine).toMatch(/<h2\b[^>]*>[\s\S]*?<span className="block overflow-clip pb-\[0\.1em\]">[\s\S]*?<\/h2>/);
    expect(titreVitrine).not.toMatch(/<h2\b[^>]*className="[^"]*overflow-clip/);
  });

  it('branche le titre dans les sections vitrine et le catalogue', () => {
    for (const component of [nuancier, frise, records, page]) {
      expect(component).toContain('import TitreVitrine from "@/components/TitreVitrine"');
      expect(component).toMatch(/<TitreVitrine\b/);
    }
    expect(records).not.toMatch(/^\s*["']use client["']/);
  });

  it('garde des marges latérales aux trois blocs sombres de la vitrine', () => {
    expect(manifeste).toMatch(/className="[^"]*\bmx-3\b[^"]*bg-vitrine-nuit/);
    expect(nuancier).toMatch(/className="[^"]*\bmx-3\b[^"]*bg-vitrine-nuit/);
    expect(records).toMatch(/className="[^"]*\bmx-3\b[^"]*bg-vitrine-abysse/);
  });

  it('lie l’illustration détaillée au contrat chromatique et à la transition partagée', () => {
    const artwork = source('../components/PokemonDetailArtwork.js');
    expect(artwork).toContain('illustrationChromatique(id)');
    expect(artwork).toMatch(/<ViewTransition\s+name=\{`pokemon-image-\$\{id\}`\}/);
    expect(artwork).toContain('aria-pressed={chromatique}');
    expect(artwork).toContain('onError={gererErreurShiny}');
    expect(artwork).toContain('setIndisponible(true)');
    expect(artwork).toContain('setChromatique(false)');
    expect(artwork).toContain('motion-safe:');
  });

  it('intègre l’illustration dans une page non-async suspendue avec CardTransition', () => {
    const detailPage = source('../app/pokemon/[id]/page.js');
    expect(detailPage).toContain('import PokemonDetailArtwork from "@/components/PokemonDetailArtwork"');
    expect(detailPage).toMatch(/export default function PokemonPage\(/);
    expect(detailPage).not.toMatch(/export default async function PokemonPage\(/);
    expect(detailPage).toMatch(/<Suspense\b[\s\S]*?<PokemonDetail paramsPromise=\{params\}\s*\/>[\s\S]*?<\/Suspense>/);
    expect(detailPage).toMatch(/<CardTransition\b[\s\S]*?<PokemonDetailArtwork\b/);
  });

  it('place les sections dans l’ordre attendu jusqu’au catalogue', () => {
    const sections = ['<HeroLentille', '<VitrineManifeste', '<VitrineNuancierTypes', '<VitrineFriseGenerations', '<VitrineRecords', 'id="catalogue"'];
    const positions = sections.map((section) => page.indexOf(section));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(page).not.toContain('min-h-screen');
    expect(page).not.toContain('ring-ring/50');
  });
});
