import { useEffect } from 'react';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';
import { pageTitle } from '@/features/anime-catalog/model/pageTitle';

export function useDocumentTitle() {
  const { format, search } = useCatalogFilters();

  useEffect(() => {
    document.title = pageTitle({ format, search });
  }, [format, search]);
}
