import { expect, it } from 'vitest';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';

it('matches the live AniList schema', async () => {
  const { animes, hasNextPage } = await fetchAnimeCatalog(new AbortController().signal);
  expect(hasNextPage).toBe(true);
  expect(animes).toHaveLength(12);
  expect(animes[0]?.title).toEqual(expect.any(String));
  expect(animes[0]?.cover?.large).toMatch(/^https:\/\/s4\.anilist\.co\//);
});
