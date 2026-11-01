import { ScoreBadge } from '@/features/anime-catalog/components/ScoreBadge';
import type { Anime, AnimeCover } from '@/features/anime-catalog/model/anime';
import { Chip } from '@/shared/ui/Chip';

const MAX_VISIBLE_GENRES = 3;
const MISSING_TITLE = 'Título indisponível';
const CARD_CLASS_NAME =
  'group relative isolate flex h-full min-h-card flex-col overflow-hidden rounded-md bg-ink';
const CLICKABLE_CARD_CLASS_NAME =
  'motion-safe:transition motion-safe:duration-150 motion-safe:hover:-translate-y-xs hover:shadow-card has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary';
const COVER_CLASS_NAME = 'absolute inset-0 -z-10 size-full object-cover';
const CLICKABLE_COVER_CLASS_NAME =
  'motion-safe:transition motion-safe:duration-150 motion-safe:group-hover:scale-105';
const COVER_SIZES =
  '(min-width: 1200px) 317px, (min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw';

interface AnimeCardProps {
  anime: Anime;
  coverLoading: 'eager' | 'lazy';
}

interface CardCoverProps {
  cover: AnimeCover;
  loading: 'eager' | 'lazy';
  clickable: boolean;
}

function CardCover({ cover, loading, clickable }: CardCoverProps) {
  return (
    <img
      src={cover.small}
      srcSet={`${cover.small} 230w, ${cover.large} 460w`}
      sizes={COVER_SIZES}
      alt=""
      loading={loading}
      decoding="async"
      className={`${COVER_CLASS_NAME} ${clickable ? CLICKABLE_COVER_CLASS_NAME : ''}`}
    />
  );
}

function CardLink({ url, children }: { url: string; children: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="cursor-pointer after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
    >
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

function GenreList({ genres }: { genres: string[] }) {
  if (genres.length === 0) return null;
  return (
    <ul aria-label="Gêneros" className="flex flex-wrap gap-sm">
      {genres.map((genre) => (
        <li key={genre}>
          <Chip lang="en">{genre}</Chip>
        </li>
      ))}
    </ul>
  );
}

export function AnimeCard({ anime, coverLoading }: AnimeCardProps) {
  const title = anime.title ?? MISSING_TITLE;
  const clickable = anime.url !== null;

  return (
    <article
      className={`${CARD_CLASS_NAME} ${clickable ? CLICKABLE_CARD_CLASS_NAME : ''}`}
      style={anime.coverColor ? { backgroundColor: anime.coverColor } : {}}
    >
      {anime.cover && (
        <CardCover cover={anime.cover} loading={coverLoading} clickable={clickable} />
      )}
      <div className="flex flex-col gap-sm bg-scrim p-lg">
        <h3
          title={title}
          className="line-clamp-3 text-lg leading-tight font-semibold wrap-break-word text-white"
        >
          {anime.url ? <CardLink url={anime.url}>{title}</CardLink> : title}
        </h3>
        <GenreList genres={anime.genres.slice(0, MAX_VISIBLE_GENRES)} />
      </div>
      <div className="relative h-xl bg-linear-to-b from-scrim to-transparent" />
      <div className="relative flex flex-1 items-end justify-end p-sm">
        <ScoreBadge score={anime.score} />
      </div>
    </article>
  );
}
