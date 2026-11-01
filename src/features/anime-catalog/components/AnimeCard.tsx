import { ScoreBadge } from '@/features/anime-catalog/components/ScoreBadge';
import type { Anime } from '@/features/anime-catalog/model/anime';
import { Chip } from '@/shared/ui/Chip';

const MAX_VISIBLE_GENRES = 3;
const MISSING_TITLE = 'Título indisponível';
const COVER_SIZES =
  '(min-width: 1200px) 317px, (min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw';

interface AnimeCardProps {
  anime: Anime;
  coverLoading: 'eager' | 'lazy';
}

export function AnimeCard({ anime, coverLoading }: AnimeCardProps) {
  const title = anime.title ?? MISSING_TITLE;
  const genres = anime.genres.slice(0, MAX_VISIBLE_GENRES);

  return (
    <article className="relative flex h-full min-h-card flex-col overflow-hidden rounded-md bg-ink">
      {anime.cover && (
        <img
          src={anime.cover.small}
          srcSet={`${anime.cover.small} 230w, ${anime.cover.large} 460w`}
          sizes={COVER_SIZES}
          alt=""
          loading={coverLoading}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="relative flex flex-col gap-sm bg-scrim p-lg">
        <h2
          title={title}
          className="line-clamp-3 text-lg leading-tight font-semibold wrap-break-word text-white"
        >
          {title}
        </h2>
        {genres.length > 0 && (
          <ul aria-label="Gêneros" className="flex flex-wrap gap-sm">
            {genres.map((genre) => (
              <li key={genre}>
                <Chip lang="en">{genre}</Chip>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative h-xl bg-linear-to-b from-scrim to-transparent" />
      <div className="relative flex flex-1 items-end justify-end p-sm">
        <ScoreBadge score={anime.score} />
      </div>
    </article>
  );
}
