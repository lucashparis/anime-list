import { CATALOG_HEADING_PROPS } from '@/features/anime-catalog/components/catalogHeading';
import { CatalogResults } from '@/features/anime-catalog/components/CatalogResults';
import { FormatFilter } from '@/features/anime-catalog/components/FormatFilter';
import { SearchForm } from '@/features/anime-catalog/components/SearchForm';
import { useDocumentTitle } from '@/features/anime-catalog/hooks/useDocumentTitle';

export function AnimeCatalog() {
  useDocumentTitle();

  return (
    <>
      <div className="mx-auto mb-xl flex max-w-content flex-col gap-lg">
        <SearchForm />
        <FormatFilter />
      </div>
      <h2 {...CATALOG_HEADING_PROPS} className="sr-only focus:outline-none">
        Catálogo de animes
      </h2>
      <CatalogResults />
    </>
  );
}
