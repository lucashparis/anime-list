import { act, screen, waitFor } from '@testing-library/react';
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

  it('keeps the focus on the field after the search is sent', async () => {
    recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), 'naruto{Enter}');
    await screen.findByRole('list', { name: 'Animes' });
    expect(searchBox()).toHaveFocus();
    expect(searchBox()).toHaveValue('naruto');
  });

  it('limits the text to 100 characters in the field and in the URL', async () => {
    window.history.replaceState(null, '', `/?q=${'a'.repeat(10_000)}`);
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    expect(searchBox()).toHaveAttribute('maxlength', '100');
    expect(searchBox()).toHaveValue('a'.repeat(100));
    expect(variables[0]).toMatchObject({ search: 'a'.repeat(100) });
  });

  it('shows the text without extra spaces after sending it', async () => {
    window.history.replaceState(null, '', '/?q=naruto');
    recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), '   {Enter}');
    expect(searchBox()).toHaveValue('naruto');
  });

  it('shows the previous search when the browser goes back', async () => {
    recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), 'naruto{Enter}');
    await screen.findByRole('list', { name: 'Animes' });
    act(() => {
      window.history.back();
    });
    await waitFor(() => {
      expect(searchBox()).toHaveValue('');
    });
  });

  it('keeps what was typed when another filter changes', async () => {
    recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), 'naruto{Enter}');
    await screen.findByRole('list', { name: 'Animes' });
    await userEvent.type(searchBox(), ' shippuden');
    await userEvent.click(screen.getByRole('button', { name: 'OVA' }));
    await screen.findByRole('list', { name: 'Animes' });
    expect(searchBox()).toHaveValue('naruto shippuden');
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
