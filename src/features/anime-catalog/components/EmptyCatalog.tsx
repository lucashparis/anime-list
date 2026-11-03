import { focusCatalogHeading } from '@/features/anime-catalog/components/catalogHeading';
import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';
import { Button } from '@/shared/ui/Button';

export function EmptyCatalog() {
  const { format, search, clearFilters } = useCatalogFilters();
  const hasFilters = format !== null || search !== '';

  function handleClear() {
    clearFilters();
    focusCatalogHeading();
  }

  return (
    <div className="flex flex-col items-center gap-lg text-center">
      <div role="status" className="flex flex-col gap-sm">
        <p className="wrap-break-word">
          {search ? `Nenhum anime encontrado para “${search}”.` : 'Nenhum anime encontrado.'}
        </p>
        {search && (
          <p>
            A busca só reconhece palavras completas do título. Se você digitou apenas o começo de um
            nome, escreva a palavra inteira, como “Naruto” em vez de “Nar”.
          </p>
        )}
      </div>
      {hasFilters && (
        <Button variant="solid" onClick={handleClear}>
          Limpar busca e filtro
        </Button>
      )}
    </div>
  );
}
