export type AnimeFormat = 'TV' | 'MOVIE' | 'TV_SHORT' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';

export interface FormatOption {
  value: AnimeFormat | null;
  label: string;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: null, label: 'Todos os formatos' },
  { value: 'TV', label: 'Série de TV' },
  { value: 'MOVIE', label: 'Filme' },
  { value: 'TV_SHORT', label: 'Curta de TV' },
  { value: 'SPECIAL', label: 'Especial' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Música' },
];

export function parseAnimeFormat(value: string | null): AnimeFormat | null {
  const option = FORMAT_OPTIONS.find((candidate) => candidate.value === value);
  return option?.value ?? null;
}
