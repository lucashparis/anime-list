import { AnimeCard } from '@/features/anime-catalog/components/AnimeCard';
import { CATALOG_GRID_CLASS_NAME } from '@/features/anime-catalog/components/catalogGrid';
import { CatalogError } from '@/features/anime-catalog/components/CatalogError';
import { CatalogSkeleton } from '@/features/anime-catalog/components/CatalogSkeleton';
import { EmptyCatalog } from '@/features/anime-catalog/components/EmptyCatalog';
import { LoadMore } from '@/features/anime-catalog/components/LoadMore';
import { useAnimeCatalog } from '@/features/anime-catalog/hooks/useAnimeCatalog';

const EAGER_COVERS = 4;

export function CatalogResults() {
  const { data, isPending, isFetchingNextPage, errorUpdateCount } = useAnimeCatalog();

  if (isPending && errorUpdateCount === 0) return <CatalogSkeleton />;

  if (data === undefined) return <CatalogError />;

  if (data.animes.length === 0) return <EmptyCatalog />;

  return (
    <>
      <ul aria-label="Animes" className={CATALOG_GRID_CLASS_NAME}>
        {data.animes.map((anime, index) => (
          <li key={anime.id}>
            <AnimeCard anime={anime} coverLoading={index < EAGER_COVERS ? 'eager' : 'lazy'} />
          </li>
        ))}
      </ul>
      {isFetchingNextPage && (
        <div className="mt-lg">
          <CatalogSkeleton label="Carregando mais animes" />
        </div>
      )}
      <LoadMore />
    </>
  );
}
