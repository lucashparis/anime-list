import { describe, expect, it } from 'vitest';
import { loadedMessage } from '@/features/anime-catalog/model/loadedMessage';

describe('loadedMessage', () => {
  it.each([
    [0, 'Nenhum anime novo carregado'],
    [1, '1 anime carregado'],
    [12, '12 animes carregados'],
  ])('describes %i new animes', (count, message) => {
    expect(loadedMessage(count)).toBe(message);
  });
});
