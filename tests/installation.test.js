import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

describe('installation du projet', () => {
  it('utilise jsconfig.json sans tsconfig.json', () => {
    expect(existsSync(new URL('../tsconfig.json', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../jsconfig.json', import.meta.url))).toBe(true);
  });

  it('déclare zustand et tailwindcss dans package.json', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    );
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    expect(dependencies).toHaveProperty('zustand');
    expect(dependencies).toHaveProperty('tailwindcss');
  });

  it("contient la section d'équipe dans AGENTS.md", () => {
    const agents = readFileSync(`${projectRoot}AGENTS.md`, 'utf8');

    expect(agents).toContain('## Équipe');
  });
});
