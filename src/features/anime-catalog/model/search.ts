export const MAX_SEARCH_LENGTH = 100;

export function normalizeSearch(value: string | null) {
  return Array.from((value ?? '').trim())
    .slice(0, MAX_SEARCH_LENGTH)
    .join('')
    .trim();
}
