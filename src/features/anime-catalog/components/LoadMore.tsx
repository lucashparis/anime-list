import { useAnimeCatalog } from '@/features/anime-catalog/hooks/useAnimeCatalog';
import { loadedMessage } from '@/features/anime-catalog/model/loadedMessage';
import { Button } from '@/shared/ui/Button';

export function LoadMore() {
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useAnimeCatalog();
  const hasLoadedMore =
    data !== undefined && data.pageCount > 1 && !isFetchingNextPage && !isFetchNextPageError;
  const announcement = hasLoadedMore ? loadedMessage(data.addedByLastPage) : '';

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
          {isFetchNextPageError ? 'Tentar novamente' : 'Ver mais'}
        </Button>
      )}
    </div>
  );
}
