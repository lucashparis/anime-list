import { describe, expect, it } from 'vitest';
import { FORMAT_OPTIONS, parseAnimeFormat } from '@/features/anime-catalog/model/formats';

describe('parseAnimeFormat', () => {
  it.each(FORMAT_OPTIONS.map((option) => option.value))('accepts %s', (value) => {
    expect(parseAnimeFormat(value)).toBe(value);
  });

  it.each([['XYZ'], ['movie'], ['']])('treats %j as all formats', (value) => {
    expect(parseAnimeFormat(value)).toBeNull();
  });
});
