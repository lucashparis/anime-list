import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { ANILIST_ENDPOINT, fulfillAnilist, test } from './support/anilist';
import { requestedVariables } from './support/requestedVariables';
import { WCAG_TAGS } from './support/screens';

const WIDTHS = [320, 768, 1366];
const LONG_TEXT = 'a'.repeat(200);
const EMPTY_PAGE = { data: { Page: { pageInfo: { hasNextPage: false }, media: [] } } };

function searchBox(page: Page) {
  return page.getByRole('searchbox', { name: 'Buscar anime' });
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
}

for (const width of WIDTHS) {
  test.describe(`text search at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('fits the screen with a long text and has no WCAG 2.2 AA violations', async ({ page }) => {
      await page.goto(`/?q=${LONG_TEXT}`);
      await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
      await expect(searchBox(page)).toHaveValue(LONG_TEXT);
      expect(await horizontalOverflow(page)).toBe(0);
      await expectNoViolations(page);
      await page.screenshot({ path: `test-results/text-search/${String(width)}.png` });
    });
  });
}

test('queries only on submit, combines with the format and sorts by relevance', async ({
  page,
}) => {
  const requests: Record<string, unknown>[] = [];
  await page.route(ANILIST_ENDPOINT, async (route) => {
    requests.push(requestedVariables(route));
    await route.fallback();
  });
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  await page.getByRole('button', { name: 'Filme' }).click();
  await searchBox(page).fill('naruto');
  expect(requests).toHaveLength(2);
  await searchBox(page).press('Enter');
  await expect(page).toHaveURL(/\?format=MOVIE&q=naruto$/);
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  expect(requests).toHaveLength(3);
  expect(requests[2]).toMatchObject({ format: 'MOVIE', search: 'naruto', sort: ['SEARCH_MATCH'] });
});

test('opens already searching from the URL and restores the text on back', async ({ page }) => {
  await page.goto('/?q=naruto');
  await expect(searchBox(page)).toHaveValue('naruto');
  await searchBox(page).fill('bleach');
  await searchBox(page).press('Enter');
  await expect(page).toHaveURL(/\?q=bleach$/);
  await page.goBack();
  await expect(searchBox(page)).toHaveValue('naruto');
});

test('shows a message without an error when nothing is found', async ({ page }) => {
  await page.route(ANILIST_ENDPOINT, (route) => fulfillAnilist(route, { json: EMPTY_PAGE }));
  await page.goto('/?q=zzz');
  await expect(page.getByText('Nenhum anime encontrado para “zzz”.')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expectNoViolations(page);
});
