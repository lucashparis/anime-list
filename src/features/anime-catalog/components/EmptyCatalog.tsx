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
      <p role="status" className="wrap-break-word">
        {search ? `Nenhum anime encontrado para “${search}”.` : 'Nenhum anime encontrado.'}
      </p>
      {hasFilters && (
        <Button variant="solid" onClick={handleClear}>
          Limpar busca e filtro
        </Button>
      )}
    </div>
  );
}
