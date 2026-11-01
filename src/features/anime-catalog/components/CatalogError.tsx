import { CatalogSkeleton } from '@/features/anime-catalog/components/CatalogSkeleton';
import { useAnimeCatalog } from '@/features/anime-catalog/hooks/useAnimeCatalog';
import { catalogErrorMessage } from '@/features/anime-catalog/model/catalogErrorMessage';
import { Button } from '@/shared/ui/Button';

export function CatalogError() {
  const { error, isFetching, refetch } = useAnimeCatalog();

  function handleRetry() {
    if (isFetching) return;
    void refetch();
  }

  return (
    <>
      <div role="alert" className="mb-xl flex flex-col items-center gap-lg text-center">
        <p>{catalogErrorMessage(error)}</p>
        <Button variant="solid" aria-disabled={isFetching} onClick={handleRetry}>
          Tentar novamente
        </Button>
      </div>
      {isFetching && <CatalogSkeleton />}
    </>
  );
}
