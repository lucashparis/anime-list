export const MAX_SEARCH_LENGTH = 100;

const WHITESPACE_RUN = /\s+/g;

export function normalizeSearch(value: string | null) {
  return Array.from((value ?? '').trim().replace(WHITESPACE_RUN, ' '))
    .slice(0, MAX_SEARCH_LENGTH)
    .join('')
    .trim();
}
