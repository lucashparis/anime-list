import { expect, it } from 'vitest';
import { ApiError } from '@/shared/api/graphqlClient';
import { createQueryClient, shouldRetry } from '@/shared/api/queryClient';

it.each([
  ['a network failure', new ApiError('network')],
  ['a server failure', new ApiError('http', 503)],
])('retries %s up to twice', (_, error) => {
  expect(shouldRetry(0, error)).toBe(true);
  expect(shouldRetry(1, error)).toBe(true);
  expect(shouldRetry(2, error)).toBe(false);
});

it.each([
  ['the rate limit', new ApiError('http', 429)],
  ['a bad request', new ApiError('http', 400)],
  ['a GraphQL error', new ApiError('graphql', 200)],
  ['an invalid response', new ApiError('schema', 200)],
  ['an unknown error', new Error('unknown')],
])('does not retry %s', (_, error) => {
  expect(shouldRetry(0, error)).toBe(false);
});

it('keeps data fresh for 5 minutes and ignores window focus', () => {
  const { queries } = createQueryClient().getDefaultOptions();
  expect(queries?.staleTime).toBe(300_000);
  expect(queries?.refetchOnWindowFocus).toBe(false);
});
