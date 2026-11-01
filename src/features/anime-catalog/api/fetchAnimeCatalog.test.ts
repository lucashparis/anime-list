import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';
import { ANILIST_ENDPOINT, anilistCatalogHandler } from '@/test/anilistHandlers';
import { recordVariables } from '@/test/recordVariables';
import { server } from '@/test/server';

const signal = new AbortController().signal;

async function fetchCatalogPage() {
  server.use(anilistCatalogHandler);
  return fetchAnimeCatalog({ format: null }, signal);
}

describe('fetchAnimeCatalog', () => {
  it('converts the response into the Anime model', async () => {
    const { animes, hasNextPage } = await fetchCatalogPage();
    expect(hasNextPage).toBe(true);
    expect(animes).toHaveLength(12);
    expect(animes[0]).toEqual({
      id: 1,
      title: 'Fixture Anime 1',
      cover: {
        small: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/fixture-1.svg',
        large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/fixture-1.svg',
      },
      score: 49,
      genres: ['Action', 'Drama'],
    });
  });

  it('keeps nullable fields without breaking the list', async () => {
    const { animes } = await fetchCatalogPage();
    expect(animes[4]?.score).toBeNull();
    expect(animes[7]?.title).toBeNull();
    expect(animes[8]?.cover).toBeNull();
    expect(animes[10]?.genres).toEqual([]);
  });

  it('reuses the available cover when one size is missing', async () => {
    const onlyLarge = { id: 1, title: { romaji: 'A' }, averageScore: 1, genres: [] };
    server.use(
      http.post(ANILIST_ENDPOINT, () =>
        HttpResponse.json({
          data: {
            Page: {
              pageInfo: { hasNextPage: false },
              media: [{ ...onlyLarge, coverImage: { large: 'small.jpg', extraLarge: null } }],
            },
          },
        }),
      ),
    );
    const { animes } = await fetchAnimeCatalog({ format: null }, signal);
    expect(animes[0]?.cover).toEqual({ small: 'small.jpg', large: 'small.jpg' });
  });

  it('sends a fixed named query, without description and without cookies', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await fetchCatalogPage();
    const init = fetchSpy.mock.calls[0]?.[1];
    fetchSpy.mockRestore();
    expect(init?.credentials).toBe('omit');
    expect(init?.body).toContain('query AnimeCatalog');
    expect(init?.body).toContain('isAdult: false');
    expect(init?.body).toContain('POPULARITY_DESC');
    expect(init?.body).not.toContain('description');
  });

  it('omits the format variable for all formats and sends it otherwise', async () => {
    const variables = recordVariables();
    await fetchAnimeCatalog({ format: null }, signal);
    await fetchAnimeCatalog({ format: 'MOVIE' }, signal);
    expect(variables).toEqual([
      { page: 1, perPage: 12 },
      { page: 1, perPage: 12, format: 'MOVIE' },
    ]);
  });
});
