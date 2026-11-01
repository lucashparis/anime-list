import { useState, type SyntheticEvent } from 'react';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';
import { MAX_SEARCH_LENGTH, normalizeSearch } from '@/features/anime-catalog/model/search';
import { Button } from '@/shared/ui/Button';

export function SearchForm() {
  const { search, setSearch } = useCatalogFilters();
  const [draft, setDraft] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setDraft(search);
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(draft);
    setDraft(normalizeSearch(draft));
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="mx-auto flex w-full max-w-search gap-sm">
      <label htmlFor="catalog-search" className="sr-only">
        Buscar anime
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        value={draft}
        maxLength={MAX_SEARCH_LENGTH}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        placeholder="Digite algo aqui…"
        autoComplete="off"
        className="min-h-control-md min-w-0 flex-1 rounded-sm border border-neutral-400 bg-white px-md text-sm text-ink placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:min-h-control-touch"
      />
      <Button type="submit" variant="solid">
        Buscar
      </Button>
    </form>
  );
}
