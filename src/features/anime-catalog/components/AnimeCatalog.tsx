import { CatalogResults } from '@/features/anime-catalog/components/CatalogResults';
import { FormatFilter } from '@/features/anime-catalog/components/FormatFilter';
import { SearchForm } from '@/features/anime-catalog/components/SearchForm';

export function AnimeCatalog() {
  return (
    <>
      <div className="mx-auto mb-xl flex max-w-content flex-col gap-lg">
        <SearchForm />
        <FormatFilter />
      </div>
      <CatalogResults />
    </>
  );
}
