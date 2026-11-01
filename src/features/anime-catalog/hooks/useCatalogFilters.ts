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

  return { format, setFormat };
}
