import { useCatalogFilters } from '@/features/anime-catalog/hooks/useCatalogFilters';
import { FORMAT_OPTIONS } from '@/features/anime-catalog/model/formats';
import { Button } from '@/shared/ui/Button';

export function FormatFilter() {
  const { format, setFormat } = useCatalogFilters();

  return (
    <div role="group" aria-label="Formato" className="flex flex-wrap gap-sm">
      {FORMAT_OPTIONS.map((option) => {
        const selected = option.value === format;
        return (
          <Button
            key={option.label}
            variant={selected ? 'solid' : 'outline'}
            aria-pressed={selected}
            onClick={() => {
              setFormat(option.value);
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
