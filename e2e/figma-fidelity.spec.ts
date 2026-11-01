import { expect, type Page } from '@playwright/test';
import { test } from './support/anilist';

const VIEWPORT_WIDTH = 1366;
const SEARCH_ROW_WIDTH = 1012;
const FILTER_HEIGHT = 32;
const CONTROL_RADIUS = '4px';
const CENTER_TOLERANCE = 2;

test.use({ viewport: { width: VIEWPORT_WIDTH, height: 900 } });

async function boxOf(page: Page, locator: ReturnType<Page['locator']>) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no box');
  return box;
}

test('lists the filters above the search and centers both', async ({ page }) => {
  await page.goto('/');
  const filters = await boxOf(page, page.getByRole('group', { name: 'Formato' }));
  const search = await boxOf(page, page.getByRole('search'));
  expect(filters.y).toBeLessThan(search.y);
  const first = await boxOf(page, page.getByRole('button', { name: 'Todos os formatos' }));
  const last = await boxOf(page, page.getByRole('button', { name: 'Música' }));
  const filterCenter = (first.x + last.x + last.width) / 2;
  const searchCenter = search.x + search.width / 2;
  expect(Math.abs(filterCenter - searchCenter)).toBeLessThanOrEqual(CENTER_TOLERANCE);
  expect(search.width).toBeLessThanOrEqual(SEARCH_ROW_WIDTH);
});

test('draws the filters and the search as in the design', async ({ page }) => {
  await page.goto('/');
  const filter = page.getByRole('button', { name: 'Filme' });
  expect((await boxOf(page, filter)).height).toBe(FILTER_HEIGHT);
  await expect(filter).toHaveCSS('border-radius', CONTROL_RADIUS);
  await expect(filter).toHaveCSS('color', 'rgb(99, 36, 198)');
  await expect(page.getByRole('searchbox')).toHaveAttribute('placeholder', 'Digite algo aqui…');
  await expect(page.getByRole('searchbox')).toHaveCSS('border-radius', CONTROL_RADIUS);
});

test('stretches "Ver mais" across the grid with a decorative plus', async ({ page }) => {
  await page.goto('/');
  const more = page.getByRole('button', { name: 'Ver mais' });
  const grid = await boxOf(page, page.getByRole('list', { name: 'Animes' }));
  const button = await boxOf(page, more);
  expect(button.width).toBe(grid.width);
  await expect(more).toHaveCSS('font-size', '20px');
  await expect(more.locator('svg')).toHaveAttribute('aria-hidden', 'true');
});
