import { useAnimeCatalog } from '@/features/anime-catalog/hooks/useAnimeCatalog';
import { Button } from '@/shared/ui/Button';

export function LoadMore() {
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useAnimeCatalog();
  const hasLoadedMore = data !== undefined && data.pageCount > 1 && !isFetchingNextPage;
  const announcement = hasLoadedMore ? `${String(data.addedByLastPage)} animes carregados` : '';

  function handleClick() {
    if (isFetchingNextPage) return;
    void fetchNextPage();
  }

  return (
    <div className="mt-xl flex flex-col items-center gap-lg">
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {isFetchNextPageError && <p role="alert">Não foi possível carregar mais animes.</p>}
      {hasNextPage && (
        <Button variant="accent" size="lg" aria-disabled={isFetchingNextPage} onClick={handleClick}>
          Ver mais
        </Button>
      )}
    </div>
  );
}
