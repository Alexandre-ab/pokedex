import { describe, expect, it } from 'vitest';
import { searchPokemon } from '../lib/filters.js';

const pokemonList = [
  { id: 1, name: 'bulbasaur' },
  { id: 25, name: 'pikachu' },
  { id: 26, name: 'raichu' },
  { id: 150, name: 'mewtwo' },
];

describe('searchPokemon', () => {
  it('renvoie toute la liste pour un texte vide ou composé d’espaces', () => {
    expect(searchPokemon(pokemonList, '')).toBe(pokemonList);
    expect(searchPokemon(pokemonList, '   ')).toBe(pokemonList);
  });

  it.each(['pika', 'PIKA'])('recherche le nom partiel sans tenir compte de la casse (%s)', (query) => {
    expect(searchPokemon(pokemonList, query)).toEqual([
      { id: 25, name: 'pikachu' },
    ]);
  });

  it.each(['25', '#25', '#025', '025'])(
    'recherche le Pokémon par numéro avec la saisie %s',
    (query) => {
      expect(searchPokemon(pokemonList, query)).toEqual([
        { id: 25, name: 'pikachu' },
      ]);
    },
  );

  it('renvoie un tableau vide sans correspondance', () => {
    expect(searchPokemon(pokemonList, 'dracaufeu')).toEqual([]);
  });
});
