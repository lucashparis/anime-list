import { CATALOG_GRID_CLASS_NAME } from '@/features/anime-catalog/components/catalogGrid';
import { Skeleton } from '@/shared/ui/Skeleton';

const PLACEHOLDER_KEYS = Array.from({ length: 12 }, (_, index) => index);

export function CatalogSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Carregando catálogo
      </p>
      <div data-testid="catalog-skeleton" aria-hidden="true" className={CATALOG_GRID_CLASS_NAME}>
        {PLACEHOLDER_KEYS.map((key) => (
          <Skeleton key={key} className="min-h-card rounded-md" />
        ))}
      </div>
    </>
  );
}
