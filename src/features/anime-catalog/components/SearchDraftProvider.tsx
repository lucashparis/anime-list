import { useMemo, useState, type ReactNode } from 'react';
import { SearchDraftContext } from '@/features/anime-catalog/hooks/searchDraftContext';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';

export function SearchDraftProvider({ children }: { children: ReactNode }) {
  const { search } = useCatalogFilters();
  const [draft, setDraft] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setDraft(search);
  }

  const value = useMemo(() => ({ draft, setDraft }), [draft]);

  return <SearchDraftContext value={value}>{children}</SearchDraftContext>;
}
