import { useQuery } from '@tanstack/react-query';
import { fetchAnimeCatalog } from '@/features/anime-catalog/api/fetchAnimeCatalog';

export function useAnimeCatalog() {
  return useQuery({
    queryKey: ['anime-catalog'],
    queryFn: ({ signal }) => fetchAnimeCatalog(signal),
  });
}
