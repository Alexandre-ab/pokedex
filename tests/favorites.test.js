import { describe, expect, it } from 'vitest';
import { toggleFavorite } from '../lib/favorites.js';

describe('toggleFavorite', () => {
  it('ajoute un id absent', () => {
    expect(toggleFavorite([1, 2], 25)).toEqual([1, 2, 25]);
  });

  it('retire un id déjà présent', () => {
    expect(toggleFavorite([1, 25, 6], 25)).toEqual([1, 6]);
  });

  it('ne mute pas le tableau reçu et renvoie un nouveau tableau', () => {
    const ids = [1, 2];
    const result = toggleFavorite(ids, 25);

    expect(ids).toEqual([1, 2]);
    expect(result).toEqual([1, 2, 25]);
    expect(result).not.toBe(ids);
  });

  it('fonctionne avec une liste vide et conserve les autres ids', () => {
    const emptyIds = [];
    const afterAdd = toggleFavorite(emptyIds, 25);

    expect(afterAdd).toEqual([25]);
    expect(afterAdd).not.toBe(emptyIds);
    expect(toggleFavorite([25, 6, 9], 6)).toEqual([25, 9]);
  });
});
