import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPokemonDetail,
  getPokemonList,
  getTypeMap,
  getTypes,
  parsePokemonId,
} from '../lib/pokeapi.js';
import nomsFr from '../lib/data/noms-fr.json';

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

  it.each([
    [1, 'Bulbizarre'],
    [25, 'Pikachu'],
    [1025, 'Pêchaminus'],
  ])('ajoute le nom français de l’id %i', async (id, nameFr) => {
    const pokemon = await getPokemonList();

    expect(pokemon.find((entry) => entry.id === id)?.nameFr).toBe(nameFr);
  });
});

describe('noms français locaux', () => {
  it('contient un nom non vide pour chacun des ids 1 à 1025', () => {
    expect(Object.keys(nomsFr)).toHaveLength(1025);

    for (let id = 1; id <= 1025; id += 1) {
      expect(nomsFr[id], `nom français manquant pour l’id ${id}`).toEqual(
        expect.any(String),
      );
      expect(nomsFr[id].trim(), `nom français vide pour l’id ${id}`).not.toBe('');
    }

    expect(Object.keys(nomsFr).map(Number)).toEqual(
      Array.from({ length: 1025 }, (_, index) => index + 1),
    );
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

describe('parsePokemonId', () => {
  it.each([
    ['1', 1],
    ['25', 25],
    ['1025', 1025],
    [25, 25],
  ])('convertit %s en id entier', (rawId, expected) => {
    expect(parsePokemonId(rawId)).toBe(expected);
    expect(Number.isInteger(parsePokemonId(rawId))).toBe(true);
  });

  it.each(['0', '1026', '2000', '-1', 'abc', '25a', ''])(
    'rejette l’id invalide %s',
    (rawId) => {
      expect(parsePokemonId(rawId)).toBeNull();
    },
  );
});

describe('getPokemonDetail', () => {
  const pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/25';
  const speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/25';
  const pokemonResponse = {
    name: 'pikachu',
    types: [{ type: { name: 'electric' } }],
    height: 4,
    weight: 60,
    stats: [
      { stat: { name: 'hp' }, base_stat: 35 },
      { stat: { name: 'speed' }, base_stat: 90 },
    ],
  };
  const speciesResponse = {
    names: [{ language: { name: 'fr' }, name: 'Pikachu' }],
    flavor_text_entries: [
      { language: { name: 'en' }, flavor_text: 'English description' },
      { language: { name: 'fr' }, flavor_text: 'Une souris\nélectrique.\f' },
    ],
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubDetailFetch(species = speciesResponse) {
    const fetchMock = vi.fn((url) => {
      const body = url === pokemonUrl ? pokemonResponse : species;
      return Promise.resolve({ json: () => Promise.resolve(body) });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('charge Pokémon et espèce en parallèle puis renvoie la fiche formatée en français', async () => {
    const fetchMock = stubDetailFetch();

    const detail = await getPokemonDetail(25);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([pokemonUrl, speciesUrl]),
    );
    expect(detail).toEqual({
      id: 25,
      name: 'Pikachu',
      image: `${IMAGE_BASE_URL}/25.png`,
      types: ['electric'],
      height: 0.4,
      weight: 6,
      stats: [
        { name: 'hp', value: 35 },
        { name: 'speed', value: 90 },
      ],
      description: 'Une souris électrique. ',
    });
  });

  it('utilise le nom API si aucun nom français n’est disponible', async () => {
    stubDetailFetch({
      names: [{ language: { name: 'en' }, name: 'Pikachu' }],
      flavor_text_entries: [
        { language: { name: 'en' }, flavor_text: 'English description' },
      ],
    });

    await expect(getPokemonDetail(25)).resolves.toMatchObject({
      name: 'pikachu',
      description: '',
    });
  });
});
