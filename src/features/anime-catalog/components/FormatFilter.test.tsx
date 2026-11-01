import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';
import { recordVariables } from '@/test/recordVariables';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

function pressedState(name: string) {
  return screen.getByRole('button', { name }).getAttribute('aria-pressed');
}

describe('FormatFilter', () => {
  it('starts with all formats selected and no format variable', async () => {
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    expect(pressedState('Todos os formatos')).toBe('true');
    const group = screen.getByRole('group', { name: 'Formato' });
    expect(within(group).getAllByRole('button')).toHaveLength(8);
    expect(variables).toEqual([{ page: 1, perPage: 12, sort: ['POPULARITY_DESC'] }]);
  });

  it('queries the chosen format and updates the URL', async () => {
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.click(screen.getByRole('button', { name: 'Filme' }));
    await screen.findByRole('list', { name: 'Animes' });
    expect(variables[1]).toEqual({
      page: 1,
      perPage: 12,
      sort: ['POPULARITY_DESC'],
      format: 'MOVIE',
    });
    expect(window.location.search).toBe('?format=MOVIE');
    expect(pressedState('Filme')).toBe('true');
    expect(pressedState('Todos os formatos')).toBe('false');
  });

  it('starts with the format from the URL', async () => {
    window.history.replaceState(null, '', '/?format=OVA');
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    expect(pressedState('OVA')).toBe('true');
    expect(variables).toEqual([{ page: 1, perPage: 12, sort: ['POPULARITY_DESC'], format: 'OVA' }]);
  });

  it('ignores an invalid format in the URL', async () => {
    window.history.replaceState(null, '', '/?format=XYZ');
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    expect(pressedState('Todos os formatos')).toBe('true');
    expect(variables).toEqual([{ page: 1, perPage: 12, sort: ['POPULARITY_DESC'] }]);
  });
});
