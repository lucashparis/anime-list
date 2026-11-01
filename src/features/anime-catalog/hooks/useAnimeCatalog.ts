import { useQuery } from '@tanstack/react-query';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';

export function useAnimeCatalog() {
  const { format } = useCatalogFilters();
  return useQuery({
    queryKey: ['anime-catalog', { format }],
    queryFn: ({ signal }) => fetchAnimeCatalog({ format }, signal),
  });
}
