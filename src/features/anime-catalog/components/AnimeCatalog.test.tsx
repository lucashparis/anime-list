import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';
import { ANILIST_ENDPOINT, anilistCatalogHandler } from '@/test/anilistHandlers';
import { LONG_TITLE } from '@/test/animeCatalogFixture';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import { server } from '@/test/server';

async function renderCards() {
  server.use(anilistCatalogHandler);
  renderWithQueryClient(<AnimeCatalog />);
  const list = await screen.findByRole('list', { name: 'Animes' });
  return within(list).getAllByRole('article');
}

function cardAt(cards: HTMLElement[], position: number) {
  const card = cards[position];
  if (!card) throw new Error(`No card at position ${String(position)}`);
  return within(card);
}

describe('AnimeCatalog', () => {
  it('shows a skeleton while the query is pending', async () => {
    server.use(anilistCatalogHandler);
    renderWithQueryClient(<AnimeCatalog />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando catálogo');
    expect(screen.getByTestId('catalog-skeleton').children).toHaveLength(12);
    await screen.findByRole('list', { name: 'Animes' });
    expect(screen.queryByTestId('catalog-skeleton')).not.toBeInTheDocument();
  });

  it('shows 12 cards with title and score', async () => {
    const cards = await renderCards();
    expect(cards).toHaveLength(12);
    const first = cardAt(cards, 0);
    expect(first.getByRole('heading', { level: 2 })).toHaveTextContent('Fixture Anime 1');
    expect(first.getByText('49%')).toHaveTextContent('Nota 49%');
  });

  it('paints each score range with its tone', async () => {
    const cards = await renderCards();
    expect(cardAt(cards, 0).getByText('49%')).toHaveClass('bg-danger', 'text-white');
    expect(cardAt(cards, 1).getByText('50%')).toHaveClass('bg-warning', 'text-ink');
    expect(cardAt(cards, 2).getByText('80%')).toHaveClass('bg-warning', 'text-ink');
    expect(cardAt(cards, 3).getByText('81%')).toHaveClass('bg-success', 'text-ink');
  });

  it('shows a neutral badge when the score is null', async () => {
    const cards = await renderCards();
    expect(cardAt(cards, 4).getByText('Sem nota')).toHaveClass('bg-neutral-100');
  });

  it('keeps the whole long title for assistive technology and hover', async () => {
    const cards = await renderCards();
    const heading = cardAt(cards, 5).getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(LONG_TITLE);
    expect(heading).toHaveAttribute('title', LONG_TITLE);
    expect(heading).toHaveClass('line-clamp-3');
  });

  it('shows at most 3 genres in English', async () => {
    const cards = await renderCards();
    const genres = within(cardAt(cards, 6).getByRole('list', { name: 'Gêneros' }));
    const items = genres.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Action', 'Adventure', 'Comedy']);
    expect(genres.getByText('Action')).toHaveAttribute('lang', 'en');
  });

  it('omits the genre list when there are no genres', async () => {
    const cards = await renderCards();
    expect(cardAt(cards, 9).queryByRole('list', { name: 'Gêneros' })).not.toBeInTheDocument();
    expect(cardAt(cards, 10).queryByRole('list', { name: 'Gêneros' })).not.toBeInTheDocument();
  });

  it('falls back when the title is null', async () => {
    const cards = await renderCards();
    expect(cardAt(cards, 7).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Título indisponível',
    );
  });

  it('marks covers as decorative and lazy after the first row', async () => {
    const cards = await renderCards();
    const coverOf = (position: number) => cards[position]?.querySelector('img');
    expect(coverOf(0)).toHaveAttribute('alt', '');
    expect(coverOf(0)).toHaveAttribute('loading', 'eager');
    expect(coverOf(0)?.getAttribute('srcset')).toMatch(/230w, .* 460w$/);
    expect(coverOf(4)).toHaveAttribute('loading', 'lazy');
    expect(coverOf(8)).toBeNull();
  });

  it.each([
    ['an HTTP failure', () => HttpResponse.json({}, { status: 400 })],
    ['GraphQL errors', () => HttpResponse.json({ data: null, errors: [{ message: 'bad' }] })],
    ['an invalid response', () => HttpResponse.json({ data: { Page: {} } })],
  ])('shows the error message on %s', async (_, response) => {
    server.use(http.post(ANILIST_ENDPOINT, response));
    renderWithQueryClient(<AnimeCatalog />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o catálogo.',
    );
  });
});
