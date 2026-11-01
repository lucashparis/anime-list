import { expect, it } from 'vitest';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';
import { FORMAT_OPTIONS } from '@/features/anime-catalog/model/formats';

const signal = new AbortController().signal;

it('matches the live AniList schema', async () => {
  const { animes, hasNextPage } = await fetchAnimeCatalog({ format: null }, signal);
  expect(hasNextPage).toBe(true);
  expect(animes).toHaveLength(12);
  expect(animes[0]?.title).toEqual(expect.any(String));
  expect(animes[0]?.cover?.large).toMatch(/^https:\/\/s4\.anilist\.co\//);
});

it('accepts every format value in the live AniList schema', async () => {
  const formats = FORMAT_OPTIONS.flatMap((option) => (option.value ? [option.value] : []));
  for (const format of formats) {
    const { animes } = await fetchAnimeCatalog({ format }, signal);
    expect(animes.length).toBeGreaterThan(0);
  }
});
