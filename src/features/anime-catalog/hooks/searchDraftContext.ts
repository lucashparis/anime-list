import { createContext, useContext } from 'react';

interface SearchDraft {
  draft: string;
  setDraft: (next: string) => void;
}

export const SearchDraftContext = createContext<SearchDraft | null>(null);

export function useSearchDraft() {
  const value = useContext(SearchDraftContext);
  if (!value) throw new Error('useSearchDraft must be used inside SearchDraftProvider');
  return value;
}
