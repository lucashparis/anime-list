import { describe, expect, it } from 'vitest';
import { catalogErrorMessage } from '@/features/anime-catalog/model/catalogErrorMessage';
import { ApiError } from '@/shared/api/graphqlClient';

describe('catalogErrorMessage', () => {
  it('explains the rate limit', () => {
    expect(catalogErrorMessage(new ApiError('http', 429))).toBe(
      'Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo.',
    );
  });

  it.each([
    new ApiError('http', 500),
    new ApiError('timeout'),
    new ApiError('network'),
    new ApiError('schema', 200),
    null,
  ])('uses the generic message for %s', (error) => {
    expect(catalogErrorMessage(error)).toBe('Não foi possível carregar o catálogo.');
  });
});
