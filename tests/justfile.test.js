import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const justfilePath = `${projectRoot}justfile`;

describe('contrat du justfile', () => {
  it('existe à la racine avec une indentation régulière en espaces', () => {
    expect(existsSync(justfilePath)).toBe(true);

    const justfile = readFileSync(justfilePath, 'utf8');
    const indentedLines = justfile.split(/\r?\n/).filter((line) => /^\s+/.test(line));

    expect(justfile).not.toMatch(/\t/);
    expect(indentedLines.length).toBeGreaterThan(0);
    expect(indentedLines.every((line) => /^ {4}\S/.test(line))).toBe(true);
  });

  it('déclare les recettes attendues avec les commandes du projet', () => {
    const justfile = readFileSync(justfilePath, 'utf8');
    const packageJson = JSON.parse(
      readFileSync(`${projectRoot}package.json`, 'utf8'),
    );
    const recipes = new Map(
      [...justfile.matchAll(/^(default|install|dev|test|lint|check|build|start|noms-fr):(?:\s*(.*))?$/gm)]
        .map(([, name, dependencies = '']) => [name, dependencies.trim()]),
    );

    expect([...recipes.keys()]).toEqual([
      'default', 'install', 'dev', 'test', 'lint', 'check', 'build', 'start', 'noms-fr',
    ]);
    expect(justfile).toMatch(/^    @just --list$/m);
    expect(justfile).toMatch(/^    npm install$/m);
    expect(justfile).toMatch(/^    npm run dev$/m);
    expect(justfile).toMatch(/^    npm test$/m);
    expect(justfile).toMatch(/^    npm run lint$/m);
    expect(recipes.get('check')).toBe('test lint');
    expect(justfile).toMatch(/^    npm run build$/m);
    expect(justfile).toMatch(/^    npm run start$/m);
    expect(justfile).toMatch(/^    node scripts\/noms-fr\.mjs$/m);
    expect(existsSync(`${projectRoot}scripts/noms-fr.mjs`)).toBe(true);

    expect(packageJson.scripts).toMatchObject({
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'eslint',
      test: 'vitest run',
    });
  });

  it('documente just dans README sans retirer les commandes npm', () => {
    const readme = readFileSync(`${projectRoot}README.md`, 'utf8');

    expect(readme).toMatch(/### Avec `just`/);
    expect(readme).toMatch(/just dev/);
    expect(readme).toMatch(/just check/);
    expect(readme).toMatch(/just build/);
    expect(readme).toMatch(/npm install/);
    expect(readme).toMatch(/npm run dev/);
    expect(readme).toMatch(/npm test/);
    expect(readme).toMatch(/npm run lint/);
    expect(readme).toMatch(/npm run build/);
  });
});
