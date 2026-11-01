import { describe, expect, it } from 'vitest';
import { pageTitle } from '@/features/anime-catalog/model/pageTitle';

describe('pageTitle', () => {
  it.each([
    [{ format: null, search: '' }, 'BuscAnime: catálogo de animes'],
    [{ format: 'MOVIE', search: '' }, 'BuscAnime: catálogo de animes · Filme'],
    [{ format: null, search: 'naruto' }, 'BuscAnime: catálogo de animes · “naruto”'],
    [{ format: 'OVA', search: 'naruto' }, 'BuscAnime: catálogo de animes · OVA · “naruto”'],
  ] as const)('describes %j', (filters, title) => {
    expect(pageTitle(filters)).toBe(title);
  });
});
