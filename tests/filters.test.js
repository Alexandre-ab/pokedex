import { describe, expect, it } from 'vitest';
import { filterByType, searchPokemon } from '../lib/filters.js';

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

describe('filterByType', () => {
  const pokemonWithTypes = [
    { id: 4, name: 'charmander' },
    { id: 5, name: 'charmeleon' },
    { id: 6, name: 'charizard' },
    { id: 7, name: 'squirtle' },
  ];
  const typeMap = {
    fire: [4, 5, 6],
    water: [7],
  };

  it('renvoie toute la liste quand le type est null ou vide', () => {
    expect(filterByType(pokemonWithTypes, typeMap, null)).toBe(pokemonWithTypes);
    expect(filterByType(pokemonWithTypes, typeMap, '')).toBe(pokemonWithTypes);
  });

  it('filtre la liste par type précis', () => {
    expect(filterByType(pokemonWithTypes, typeMap, 'fire')).toEqual(
      pokemonWithTypes.slice(0, 3),
    );
  });

  it('renvoie un tableau vide pour un type inconnu', () => {
    expect(filterByType(pokemonWithTypes, typeMap, 'cosmic')).toEqual([]);
  });

  it('combine le filtre par type avec la recherche par nom', () => {
    const firePokemon = filterByType(pokemonWithTypes, typeMap, 'fire');

    expect(searchPokemon(firePokemon, 'char')).toEqual(pokemonWithTypes.slice(0, 3));
  });
});
