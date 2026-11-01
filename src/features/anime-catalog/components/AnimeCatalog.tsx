import { CatalogResults } from '@/features/anime-catalog/components/CatalogResults';
import { FormatFilter } from '@/features/anime-catalog/components/FormatFilter';

export function AnimeCatalog() {
  return (
    <>
      <div className="mx-auto mb-xl flex max-w-content flex-col gap-lg">
        <FormatFilter />
      </div>
      <CatalogResults />
    </>
  );
}
