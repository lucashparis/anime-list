import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';
import { ANILIST_ENDPOINT } from '@/test/anilistHandlers';
import { animeCatalogResponse } from '@/test/animeCatalogFixture';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import { server } from '@/test/server';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

const emptyPage = { data: { Page: { pageInfo: { hasNextPage: false }, media: [] } } };
const WHOLE_WORD_HINT =
  'A busca só reconhece palavras completas do título. Se você digitou apenas o começo de um nome, escreva a palavra inteira, como “Naruto” em vez de “Nar”.';

describe('CatalogError', () => {
  it('retries the query with the same button until the API answers', async () => {
    let requests = 0;
    server.use(
      http.post(ANILIST_ENDPOINT, () => {
        requests += 1;
        if (requests === 1) return HttpResponse.json({}, { status: 400 });
        return HttpResponse.json(animeCatalogResponse);
      }),
    );
    renderWithQueryClient(<AnimeCatalog />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível carregar o catálogo.');
    await userEvent.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));
    const list = await screen.findByRole('list', { name: 'Animes' });
    expect(within(list).getAllByRole('article')).toHaveLength(12);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(requests).toBe(2);
    expect(screen.getByRole('heading', { level: 2, name: 'Catálogo de animes' })).toHaveFocus();
  });

  it('explains the rate limit and does not repeat the query by itself', async () => {
    let requests = 0;
    server.use(
      http.post(ANILIST_ENDPOINT, () => {
        requests += 1;
        return HttpResponse.json({}, { status: 429 });
      }),
    );
    renderWithQueryClient(<AnimeCatalog />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo.',
    );
    expect(requests).toBe(1);
  });
});

describe('EmptyCatalog', () => {
  it('names the search term and clears the search and the format', async () => {
    window.history.replaceState(null, '', '/?format=OVA&q=zzz');
    let requests = 0;
    server.use(
      http.post(ANILIST_ENDPOINT, () => {
        requests += 1;
        if (requests === 1) return HttpResponse.json(emptyPage);
        return HttpResponse.json(animeCatalogResponse);
      }),
    );
    renderWithQueryClient(<AnimeCatalog />);
    const message = await screen.findByText('Nenhum anime encontrado para “zzz”.');
    expect(message.closest('[role="status"]')).toHaveTextContent(WHOLE_WORD_HINT);
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca e filtro' }));
    await screen.findByRole('list', { name: 'Animes' });
    expect(window.location.search).toBe('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('heading', { level: 2, name: 'Catálogo de animes' })).toHaveFocus();
  });

  it('has no clear button when nothing is filtered', async () => {
    server.use(http.post(ANILIST_ENDPOINT, () => HttpResponse.json(emptyPage)));
    renderWithQueryClient(<AnimeCatalog />);
    expect(await screen.findByText('Nenhum anime encontrado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar busca e filtro' })).not.toBeInTheDocument();
    expect(screen.queryByText(WHOLE_WORD_HINT)).not.toBeInTheDocument();
  });
});
