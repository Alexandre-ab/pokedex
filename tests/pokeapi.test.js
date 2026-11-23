import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPokemonList, getTypeMap, getTypes } from '../lib/pokeapi.js';

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1025';
const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

function createPokemonEntry(id) {
  return {
    name: `pokemon-${id}`,
    url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
  };
}

describe('getPokemonList', () => {
  let fetchMock;

  beforeEach(() => {
    const results = [
      createPokemonEntry(0),
      ...Array.from({ length: 1025 }, (_, index) => createPokemonEntry(index + 1)),
      createPokemonEntry(10001),
    ];

    fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ results }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fait un seul appel à l’URL PokéAPI attendue', async () => {
    await getPokemonList();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(API_URL);
  });

  it('extrait un id entier depuis l’URL de chaque entrée', async () => {
    const pokemon = await getPokemonList();

    expect(pokemon[24].id).toBe(25);
    expect(Number.isInteger(pokemon[24].id)).toBe(true);
  });

  it('construit l’image officielle à partir de l’id', async () => {
    const pokemon = await getPokemonList();

    expect(pokemon[24].image).toBe(`${IMAGE_BASE_URL}/25.png`);
  });

  it('retourne les ids de 1 à 1025 et filtre ceux hors plage', async () => {
    const pokemon = await getPokemonList();
    const ids = pokemon.map(({ id }) => id);

    expect(ids).toHaveLength(1025);
    expect(ids).toEqual(Array.from({ length: 1025 }, (_, index) => index + 1));
    expect(ids).not.toContain(0);
    expect(ids).not.toContain(10001);
  });
});

const playableTypes = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy',
];

describe('getTypes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exclut unknown, shadow et stellar et renvoie les types jouables', async () => {
    const results = [...playableTypes, 'unknown', 'shadow', 'stellar'].map((name) => ({ name }));
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ results }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getTypes()).resolves.toEqual(playableTypes);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type');
  });
});

describe('getTypeMap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('appelle chaque type jouable et ne conserve que les ids de 1 à 1025', async () => {
    const listResponse = { results: [...playableTypes, 'unknown', 'shadow', 'stellar'].map((name) => ({ name })) };
    const fetchMock = vi.fn((url) => {
      if (url === 'https://pokeapi.co/api/v2/type') {
        return Promise.resolve({ json: () => Promise.resolve(listResponse) });
      }

      return Promise.resolve({
        json: () => Promise.resolve({
          pokemon: [1, 1025, 1026, 10001].map((id) => ({
            pokemon: { url: `https://pokeapi.co/api/v2/pokemon/${id}/` },
          })),
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const typeMap = await getTypeMap();

    expect(fetchMock).toHaveBeenCalledTimes(playableTypes.length + 1);
    expect(fetchMock.mock.calls.map(([url]) => url)).toContainEqual('https://pokeapi.co/api/v2/type');
    for (const type of playableTypes) {
      expect(fetchMock).toHaveBeenCalledWith(`https://pokeapi.co/api/v2/type/${type}`);
      expect(typeMap[type]).toEqual([1, 1025]);
      expect(typeMap[type]).not.toContain(1026);
      expect(typeMap[type]).not.toContain(10001);
    }
    expect(Object.keys(typeMap)).toEqual(playableTypes);
  });
});
