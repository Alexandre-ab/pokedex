import { describe, expect, it } from 'vitest';
import { formatMeasure, getPokemonNeighbors } from '../lib/format.js';

describe('formatMeasure', () => {
  it.each([
    [1.5, 'm', '1,5 m'],
    [39.5, 'kg', '39,5 kg'],
    [6, 'kg', '6 kg'],
  ])('formate %s %s selon la locale française', (value, unit, expected) => {
    expect(formatMeasure(value, unit)).toBe(expected);
  });
});

describe('getPokemonNeighbors', () => {
  it('renvoie aucun précédent pour #001 et Herbizarre comme suivant #002', () => {
    expect(getPokemonNeighbors(1)).toEqual({
      prev: null,
      next: { id: 2, number: '002', name: 'Herbizarre' },
    });
  });

  it('renvoie Roucoups (#017) et Rattata (#019) autour de #018', () => {
    expect(getPokemonNeighbors(18)).toEqual({
      prev: { id: 17, number: '017', name: 'Roucoups' },
      next: { id: 19, number: '019', name: 'Rattata' },
    });
  });

  it('renvoie le précédent #1024 et aucun suivant pour #1025', () => {
    expect(getPokemonNeighbors(1025)).toEqual({
      prev: { id: 1024, number: '1024', name: 'Terapagos' },
      next: null,
    });
  });
});
