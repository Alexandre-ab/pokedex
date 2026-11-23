import { describe, expect, it } from 'vitest';
import {
  addToTeam,
  MAX_TEAM_SIZE,
  removeFromTeam,
} from '../lib/team.js';

describe('addToTeam', () => {
  it('ajoute normalement jusqu’à six Pokémon sans muter le tableau reçu', () => {
    const initialTeam = [];
    let team = initialTeam;

    for (let id = 1; id <= MAX_TEAM_SIZE; id += 1) {
      const previousTeam = team;
      const result = addToTeam(team, id);

      expect(result).toEqual({ team: [...previousTeam, id], ok: true, reason: null });
      expect(result.team).not.toBe(previousTeam);
      team = result.team;
    }

    expect(MAX_TEAM_SIZE).toBe(6);
    expect(team).toEqual([1, 2, 3, 4, 5, 6]);
    expect(initialTeam).toEqual([]);
  });

  it('refuse un doublon avec un motif explicite et garde la même équipe', () => {
    const team = [1, 25, 6];

    const result = addToTeam(team, 25);

    expect(result.ok).toBe(false);
    expect(result.team).toBe(team);
    expect(result.team).toEqual([1, 25, 6]);
    expect(result.reason).toMatch(/déjà dans la sacoche/i);
  });

  it('refuse un septième Pokémon avec un motif explicite', () => {
    const team = [1, 2, 3, 4, 5, 6];

    const result = addToTeam(team, 7);

    expect(result.ok).toBe(false);
    expect(result.team).toBe(team);
    expect(result.team).toHaveLength(6);
    expect(result.team).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.reason).toMatch(/pleine.*6 Pokémon maximum/i);
  });
});

describe('removeFromTeam', () => {
  it('retire l’id demandé sans muter le tableau d’entrée', () => {
    const team = [1, 25, 6];

    const result = removeFromTeam(team, 25);

    expect(result).toEqual([1, 6]);
    expect(result).not.toBe(team);
    expect(team).toEqual([1, 25, 6]);
  });

  it('renvoie un tableau inchangé si l’id est absent', () => {
    const team = [1, 6];

    const result = removeFromTeam(team, 25);

    expect(result).toEqual(team);
    expect(result).not.toBe(team);
    expect(team).toEqual([1, 6]);
  });
});
