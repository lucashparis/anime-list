import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';
import { ANILIST_ENDPOINT } from '@/test/anilistHandlers';
import { recordVariables } from '@/test/recordVariables';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import { server } from '@/test/server';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

const emptyPage = { data: { Page: { pageInfo: { hasNextPage: false }, media: [] } } };

function searchBox() {
  return screen.getByRole('searchbox', { name: 'Buscar anime' });
}

describe('SearchForm', () => {
  it('does not query while typing and queries once on Enter', async () => {
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), 'naruto');
    expect(variables).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('list', { name: 'Animes' });
    expect(variables).toHaveLength(2);
    expect(variables[1]).toEqual({
      page: 1,
      perPage: 12,
      sort: ['SEARCH_MATCH'],
      search: 'naruto',
    });
    expect(window.location.search).toBe('?q=naruto');
  });

  it('queries when the button is clicked and combines with the format', async () => {
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.click(screen.getByRole('button', { name: 'Filme' }));
    await userEvent.type(searchBox(), '  bleach ');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('list', { name: 'Animes' });
    expect(variables.at(-1)).toEqual({
      page: 1,
      perPage: 12,
      sort: ['SEARCH_MATCH'],
      format: 'MOVIE',
      search: 'bleach',
    });
    expect(window.location.search).toBe('?format=MOVIE&q=bleach');
  });

  it('keeps the search when the format changes', async () => {
    window.history.replaceState(null, '', '/?q=naruto');
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    expect(searchBox()).toHaveValue('naruto');
    await userEvent.click(screen.getByRole('button', { name: 'OVA' }));
    await screen.findByRole('list', { name: 'Animes' });
    expect(variables.at(-1)).toMatchObject({ format: 'OVA', search: 'naruto' });
  });

  it('goes back to popularity and leaves the URL when the text is blank', async () => {
    window.history.replaceState(null, '', '/?q=naruto');
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.clear(searchBox());
    await userEvent.type(searchBox(), '   {Enter}');
    await screen.findByRole('list', { name: 'Animes' });
    expect(variables.at(-1)).toEqual({ page: 1, perPage: 12, sort: ['POPULARITY_DESC'] });
    expect(window.location.search).toBe('');
  });

  it('shows a message, not an error, when nothing is found', async () => {
    server.use(http.post(ANILIST_ENDPOINT, () => HttpResponse.json(emptyPage)));
    renderWithQueryClient(<AnimeCatalog />);
    expect(await screen.findByText('Nenhum anime encontrado.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
