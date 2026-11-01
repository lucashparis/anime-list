import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { animeCatalogResponse } from '../src/test/animeCatalogFixture';
import { ANILIST_ENDPOINT, fulfillAnilist, test } from './support/anilist';
import { WCAG_TAGS } from './support/screens';

const WIDTHS = [320, 768, 1366];
const TIMEOUT_WAIT = 15_000;
const EMPTY_PAGE = { data: { Page: { pageInfo: { hasNextPage: false }, media: [] } } };
const GENERIC_ERROR = 'Não foi possível carregar o catálogo.';

function retryButton(page: Page) {
  return page.getByRole('button', { name: 'Tentar novamente' });
}

async function expectCleanLayout(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
}

for (const width of WIDTHS) {
  test.describe(`feedback states at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('error state fits the screen and has no violations', async ({ page }) => {
      await page.route(ANILIST_ENDPOINT, (route) =>
        fulfillAnilist(route, { status: 400, json: {} }),
      );
      await page.goto('/');
      await expect(page.getByRole('alert')).toContainText(GENERIC_ERROR);
      await expectCleanLayout(page);
      await page.screenshot({ path: `test-results/feedback-states/error-${String(width)}.png` });
    });

    test('empty state fits the screen and has no violations', async ({ page }) => {
      await page.route(ANILIST_ENDPOINT, (route) => fulfillAnilist(route, { json: EMPTY_PAGE }));
      await page.goto(`/?format=OVA&q=${'zzz '.repeat(40)}`);
      await expect(page.getByRole('button', { name: 'Limpar busca e filtro' })).toBeVisible();
      await expectCleanLayout(page);
      await page.screenshot({ path: `test-results/feedback-states/empty-${String(width)}.png` });
    });
  });
}

test('gives up after 10 seconds and recovers with the retry button', async ({ page }) => {
  let hang = true;
  await page.route(ANILIST_ENDPOINT, async (route) => {
    if (!hang) return fulfillAnilist(route, { json: animeCatalogResponse });
    await new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_WAIT));
    return route.abort();
  });
  await page.goto('/');
  await expect(page.getByTestId('catalog-skeleton')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(GENERIC_ERROR, { timeout: TIMEOUT_WAIT });
  hang = false;
  await retryButton(page).click();
  await expect(page.getByRole('list', { name: 'Animes' }).getByRole('article')).toHaveCount(12);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('explains the rate limit without repeating the request', async ({ page }) => {
  let requests = 0;
  await page.route(ANILIST_ENDPOINT, (route) => {
    requests += 1;
    return fulfillAnilist(route, { status: 429, json: {} });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Muitas consultas em pouco tempo');
  await page.waitForTimeout(1500);
  expect(requests).toBe(1);
});

test('clears the search and the format from the empty state', async ({ page }) => {
  let empty = true;
  await page.route(ANILIST_ENDPOINT, (route) =>
    fulfillAnilist(route, { json: empty ? EMPTY_PAGE : animeCatalogResponse }),
  );
  await page.goto('/?format=OVA&q=zzz');
  await expect(page.getByText('Nenhum anime encontrado para “zzz”.')).toBeVisible();
  empty = false;
  await page.getByRole('button', { name: 'Limpar busca e filtro' }).click();
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('searchbox')).toHaveValue('');
});
