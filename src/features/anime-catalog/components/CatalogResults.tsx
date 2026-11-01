import { AnimeCard } from '@/features/anime-catalog/components/AnimeCard';
import { CATALOG_GRID_CLASS_NAME } from '@/features/anime-catalog/components/catalogGrid';
import { CatalogSkeleton } from '@/features/anime-catalog/components/CatalogSkeleton';
import { useAnimeCatalog } from '@/features/anime-catalog/hooks/useAnimeCatalog';

const EAGER_COVERS = 4;

export function CatalogResults() {
  const { data, isPending, isError } = useAnimeCatalog();

  if (isPending) return <CatalogSkeleton />;

  if (isError) {
    return (
      <p role="alert" className="text-center">
        Não foi possível carregar o catálogo.
      </p>
    );
  }

  if (data.animes.length === 0) {
    return (
      <p role="status" className="text-center">
        Nenhum anime encontrado.
      </p>
    );
  }

  return (
    <ul aria-label="Animes" className={CATALOG_GRID_CLASS_NAME}>
      {data.animes.map((anime, index) => (
        <li key={anime.id}>
          <AnimeCard anime={anime} coverLoading={index < EAGER_COVERS ? 'eager' : 'lazy'} />
        </li>
      ))}
    </ul>
  );
}
