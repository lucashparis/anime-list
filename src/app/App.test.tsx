import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { App } from '@/app/App';
import { anilistCatalogHandler } from '@/test/anilistHandlers';
import { server } from '@/test/server';

async function renderApp() {
  server.use(anilistCatalogHandler);
  render(<App />);
  await screen.findByRole('list', { name: 'Animes' });
}

it('exposes the page landmarks and heading', async () => {
  await renderApp();
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BuscAnime');
});

it('credits AniList in a new tab without leaking the referrer', async () => {
  await renderApp();
  const link = screen.getByRole('link', { name: 'AniList (abre em nova aba)' });
  expect(link).toHaveAttribute('href', 'https://anilist.co');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noreferrer');
});

it('reveals the privacy notice on demand', async () => {
  await renderApp();
  await userEvent.click(screen.getByText('Aviso de privacidade'));
  expect(screen.getByText(/recebe seu IP e os termos buscados/)).toBeVisible();
});

it('offers a skip link to the main content', async () => {
  await renderApp();
  expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
    'href',
    '#main-content',
  );
});
