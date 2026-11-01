import type { Anime, AnimePage } from '@/features/anime-catalog/model/anime';

export interface MergedCatalog {
  animes: Anime[];
  addedByLastPage: number;
  pageCount: number;
}

function uniqueAnimes(pages: AnimePage[]) {
  const seen = new Set<number>();
  return pages
    .flatMap((page) => page.animes)
    .filter((anime) => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });
}

export function mergePages({ pages }: { pages: AnimePage[] }): MergedCatalog {
  const animes = uniqueAnimes(pages);
  return {
    animes,
    addedByLastPage: animes.length - uniqueAnimes(pages.slice(0, -1)).length,
    pageCount: pages.length,
  };
}
