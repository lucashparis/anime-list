import { describe, expect, it } from 'vitest';
import { MAX_SEARCH_LENGTH, normalizeSearch } from '@/features/anime-catalog/model/search';

describe('normalizeSearch', () => {
  it.each([
    [null, ''],
    ['', ''],
    ['   ', ''],
    ['  naruto ', 'naruto'],
  ])('turns %j into %j', (value, expected) => {
    expect(normalizeSearch(value)).toBe(expected);
  });

  it('keeps at most the first 100 characters', () => {
    const long = 'a'.repeat(10_000);
    expect(normalizeSearch(long)).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it('cuts by character, never in the middle of an emoji', () => {
    const value = `${'a'.repeat(MAX_SEARCH_LENGTH - 1)}😀😀`;
    expect(normalizeSearch(value)).toBe(`${'a'.repeat(MAX_SEARCH_LENGTH - 1)}😀`);
  });

  it('does not end with a space after cutting', () => {
    const value = `${'a'.repeat(MAX_SEARCH_LENGTH - 1)} b`;
    expect(normalizeSearch(value)).toBe('a'.repeat(MAX_SEARCH_LENGTH - 1));
  });
});
