import { FORMAT_OPTIONS, type AnimeFormat } from '@/features/anime-catalog/model/formats';

const BASE_TITLE = 'BuscAnime: catálogo de animes';

interface TitleFilters {
  format: AnimeFormat | null;
  search: string;
}

export function pageTitle({ format, search }: TitleFilters) {
  const label = FORMAT_OPTIONS.find((option) => format && option.value === format)?.label;
  return [BASE_TITLE, label, search && `“${search}”`].filter(Boolean).join(' · ');
}
