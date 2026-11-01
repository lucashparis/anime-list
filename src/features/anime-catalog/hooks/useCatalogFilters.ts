import { useCallback } from 'react';
import { type AnimeFormat, parseAnimeFormat } from '@/features/anime-catalog/model/formats';
import { useUrlSearchParams } from '@/shared/hooks/useUrlSearchParams';

export function useCatalogFilters() {
  const { params, update } = useUrlSearchParams();
  const format = parseAnimeFormat(params.get('format'));

  const setFormat = useCallback(
    (next: AnimeFormat | null) => {
      update({ format: next });
    },
    [update],
  );

  const search = params.get('q')?.trim() ?? '';

  const setSearch = useCallback(
    (next: string) => {
      update({ q: next.trim() || null });
    },
    [update],
  );

  const clearFilters = useCallback(() => {
    update({ format: null, q: null });
  }, [update]);

  return { format, setFormat, search, setSearch, clearFilters };
}
