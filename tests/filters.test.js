import { describe, expect, it } from 'vitest';
import { filterByType, searchPokemon } from '../lib/filters.js';

const pokemonList = [
  { id: 1, name: 'bulbasaur' },
  { id: 25, name: 'pikachu' },
  { id: 26, name: 'raichu' },
  { id: 150, name: 'mewtwo' },
];

describe('searchPokemon', () => {
  const pokemonWithFrenchNames = [
    { id: 1, name: 'bulbasaur', nameFr: 'Bulbizarre' },
    { id: 6, name: 'charizard', nameFr: 'Dracaufeu' },
    { id: 1025, name: 'pecharunt', nameFr: 'Pêchaminus' },
  ];

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

  it.each(['bulbizarre', 'dracaufeu', 'pechaminus', 'pêchaminus'])(
    'recherche le nom français avec ou sans accent (%s)',
    (query) => {
      const expectedId = query === 'bulbizarre' ? 1 : query === 'dracaufeu' ? 6 : 1025;

      expect(searchPokemon(pokemonWithFrenchNames, query)).toEqual([
        pokemonWithFrenchNames.find((pokemon) => pokemon.id === expectedId),
      ]);
    },
  );

  it.each(['bulbasaur', 'charizard'])('recherche aussi le nom anglais (%s)', (query) => {
    const pokemon = pokemonWithFrenchNames.find((entry) => entry.name === query);

    expect(searchPokemon(pokemonWithFrenchNames, query)).toEqual([pokemon]);
  });

  it('reste compatible avec les objets qui ne possèdent pas nameFr', () => {
    const pokemonWithoutFrenchName = [{ id: 4, name: 'charmander' }];

    expect(searchPokemon(pokemonWithoutFrenchName, 'char')).toEqual(
      pokemonWithoutFrenchName,
    );
    expect(searchPokemon(pokemonWithoutFrenchName, 'dracaufeu')).toEqual([]);
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
