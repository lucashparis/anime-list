import { FORMAT_OPTIONS, type AnimeFormat } from '@/features/anime-catalog/model/formats';

const BASE_TITLE = 'BuscAnime: catálogo de animes';

interface TitleFilters {
  format: AnimeFormat | null;
  search: string;
}

export function pageTitle({ format, search }: TitleFilters) {
  const formatLabel = FORMAT_OPTIONS.find((option) => option.value === format)?.label;
  const parts = [format ? formatLabel : null, search ? `“${search}”` : null];
  return [BASE_TITLE, ...parts.filter((part) => part)].join(' · ');
}
