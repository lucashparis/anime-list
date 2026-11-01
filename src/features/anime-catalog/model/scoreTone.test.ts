import { expect, it } from 'vitest';
import { getScoreTone } from '@/features/anime-catalog/model/scoreTone';

it.each([
  [0, 'danger'],
  [49, 'danger'],
  [50, 'warning'],
  [80, 'warning'],
  [81, 'success'],
  [100, 'success'],
] as const)('maps score %i to the %s tone', (score, tone) => {
  expect(getScoreTone(score)).toBe(tone);
});
