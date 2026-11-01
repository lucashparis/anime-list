import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';
import { mergePages } from '@/features/anime-catalog/model/mergePages';

export function useAnimeCatalog() {
  const { format, search } = useCatalogFilters();
  return useInfiniteQuery({
    queryKey: ['anime-catalog', { format, search }],
    queryFn: ({ pageParam, signal }) =>
      fetchAnimeCatalog({ format, search, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasNextPage ? lastPageParam + 1 : undefined,
    select: mergePages,
  });
}
