import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';
import { ANILIST_ENDPOINT } from '@/test/anilistHandlers';
import { animeCatalogResponse, pagedCatalogResponse } from '@/test/animeCatalogFixture';
import { readVariables, recordVariables } from '@/test/recordVariables';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import { server } from '@/test/server';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

function loadMoreButton() {
  return screen.getByRole('button', { name: 'Ver mais' });
}

async function cardCount() {
  const list = await screen.findByRole('list', { name: 'Animes' });
  return within(list).getAllByRole('article').length;
}

function serveSecondPage(respond: () => Response | Promise<Response>) {
  const pages: number[] = [];
  server.use(
    http.post(ANILIST_ENDPOINT, async ({ request }) => {
      const { page } = await readVariables(request);
      pages.push(page);
      if (page === 1) return HttpResponse.json(animeCatalogResponse);
      return respond();
    }),
  );
  return pages;
}

describe('LoadMore', () => {
  it('appends the next page with the same filter and search, and announces it', async () => {
    window.history.replaceState(null, '', '/?format=MOVIE&q=naruto');
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    expect(await cardCount()).toBe(12);
    await userEvent.click(loadMoreButton());
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument();
    expect(await cardCount()).toBe(24);
    expect(variables[1]).toMatchObject({ page: 2, format: 'MOVIE', search: 'naruto' });
    expect(loadMoreButton()).toHaveFocus();
  });

  it('shows 12 skeletons below the list and ignores clicks while loading', async () => {
    let release = () => {};
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pages = serveSecondPage(async () => {
      await released;
      return HttpResponse.json(pagedCatalogResponse(2, false));
    });
    renderWithQueryClient(<AnimeCatalog />);
    await cardCount();
    await userEvent.click(loadMoreButton());
    expect(await screen.findByText('Carregando mais animes')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-skeleton').children).toHaveLength(12);
    expect(loadMoreButton()).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(loadMoreButton());
    release();
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument();
    expect(pages).toEqual([1, 2]);
    expect(screen.queryByTestId('catalog-skeleton')).not.toBeInTheDocument();
  });

  it('hides the button when there is no next page', async () => {
    serveSecondPage(() => HttpResponse.json(pagedCatalogResponse(2, false)));
    renderWithQueryClient(<AnimeCatalog />);
    await cardCount();
    await userEvent.click(loadMoreButton());
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver mais' })).not.toBeInTheDocument();
  });

  it('keeps the cards on failure and tries again with the same button', async () => {
    let succeed = false;
    serveSecondPage(() =>
      succeed
        ? HttpResponse.json(pagedCatalogResponse(2, false))
        : HttpResponse.json({}, { status: 400 }),
    );
    renderWithQueryClient(<AnimeCatalog />);
    await cardCount();
    await userEvent.click(loadMoreButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar mais animes.',
    );
    expect(await cardCount()).toBe(12);
    succeed = true;
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument();
    expect(await cardCount()).toBe(24);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not repeat an anime that moved between pages', async () => {
    serveSecondPage(() => HttpResponse.json(pagedCatalogResponse(1, false)));
    renderWithQueryClient(<AnimeCatalog />);
    await cardCount();
    await userEvent.click(loadMoreButton());
    await screen.findByRole('list', { name: 'Animes' });
    expect(await cardCount()).toBe(12);
  });

  it('goes back to the first page when the format changes', async () => {
    const variables = recordVariables();
    renderWithQueryClient(<AnimeCatalog />);
    await cardCount();
    await userEvent.click(loadMoreButton());
    expect(await screen.findByText('12 animes carregados')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'OVA' }));
    expect(await cardCount()).toBe(12);
    expect(variables.at(-1)).toMatchObject({ page: 1, format: 'OVA' });
  });
});
