import { describe, expect, it } from 'vitest';
import type { Anime, AnimePage } from '@/features/anime-catalog/model/anime';
import { mergePages } from '@/features/anime-catalog/model/mergePages';

function page(...ids: number[]): AnimePage {
  const animes: Anime[] = ids.map((id) => ({
    id,
    title: null,
    cover: null,
    score: null,
    genres: [],
  }));
  return { animes, hasNextPage: true };
}

describe('mergePages', () => {
  it('joins the pages in order and counts what the last one added', () => {
    const merged = mergePages({ pages: [page(1, 2), page(3, 4)] });
    expect(merged.animes.map((anime) => anime.id)).toEqual([1, 2, 3, 4]);
    expect(merged.addedByLastPage).toBe(2);
    expect(merged.pageCount).toBe(2);
  });

  it('drops an anime that moved between pages', () => {
    const merged = mergePages({ pages: [page(1, 2), page(2, 3)] });
    expect(merged.animes.map((anime) => anime.id)).toEqual([1, 2, 3]);
    expect(merged.addedByLastPage).toBe(1);
  });

  it('adds nothing when the last page only repeats animes', () => {
    expect(mergePages({ pages: [page(1, 2), page(1, 2)] }).addedByLastPage).toBe(0);
  });
});
