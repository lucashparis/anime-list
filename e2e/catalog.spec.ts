import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { LONG_TITLE } from '../src/test/animeCatalogFixture';
import { ANILIST_ENDPOINT, fulfillAnilist, fulfillCatalog, test } from './support/anilist';
import { SCREENS, WCAG_TAGS } from './support/screens';

const NETWORK_RETRIES_TIMEOUT = 15_000;
const TITLE_LINE_HEIGHT = 30;
const MAX_TITLE_LINES = 3;

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
}

function catalogList(page: Page) {
  return page.getByRole('list', { name: 'Animes' });
}

async function loadEveryCover(page: Page) {
  const covers = page.locator('article img');
  for (const cover of await covers.all()) {
    await cover.scrollIntoViewIfNeeded();
    await expect.poll(() => cover.evaluate((image: HTMLImageElement) => image.complete)).toBe(true);
  }
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

for (const screen of SCREENS) {
  const { name, width, height } = screen;
  const deviceScaleFactor = 'deviceScaleFactor' in screen ? screen.deviceScaleFactor : 1;

  test.describe(name, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor });

    test(`${name}: shows the catalog without horizontal scroll`, async ({ page }) => {
      await page.goto('/');
      await expect(catalogList(page).getByRole('article')).toHaveCount(12);
      await loadEveryCover(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      await page.screenshot({ path: `test-results/layout/${name}.png`, fullPage: true });
    });

    test(`${name}: has no WCAG 2.2 AA violations in the catalog`, async ({ page }) => {
      await page.goto('/');
      await expect(catalogList(page)).toBeVisible();
      await expectNoViolations(page);
    });
  });
}

test.describe('long title on a phone', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('clamps the title to 3 lines and keeps the text', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 2, name: LONG_TITLE });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box?.height).toBeLessThanOrEqual(TITLE_LINE_HEIGHT * MAX_TITLE_LINES);
    const isClamped = await heading.evaluate((title) => title.scrollHeight > title.clientHeight);
    expect(isClamped).toBe(true);
  });
});

test('shows the skeleton until the API answers', async ({ page }) => {
  let answerApi = () => {};
  const apiAnswered = new Promise<void>((resolve) => {
    answerApi = resolve;
  });
  await page.route(ANILIST_ENDPOINT, async (route) => {
    await apiAnswered;
    await fulfillCatalog(route);
  });
  await page.goto('/');
  await expect(page.getByTestId('catalog-skeleton').locator('> div')).toHaveCount(12);
  await expect(page.getByRole('status')).toHaveText('Carregando catálogo');
  await expectNoViolations(page);
  answerApi();
  await expect(catalogList(page)).toBeVisible();
  await expect(page.getByTestId('catalog-skeleton')).toHaveCount(0);
});

test('does not request the description field', async ({ page }) => {
  const requestPromise = page.waitForRequest(ANILIST_ENDPOINT);
  await page.goto('/');
  const request = await requestPromise;
  expect(request.postData()).not.toContain('description');
});

const ERROR_RESPONSES = [
  { name: 'an HTTP failure', response: { status: 400, json: {} } },
  { name: 'GraphQL errors with status 200', response: { json: { errors: [{ message: 'bad' }] } } },
  { name: 'a response outside the schema', response: { json: { data: { Page: {} } } } },
];

for (const { name, response } of ERROR_RESPONSES) {
  test(`shows the error message on ${name}`, async ({ page }) => {
    await page.route(ANILIST_ENDPOINT, (route) => fulfillAnilist(route, response));
    await page.goto('/');
    await expect(page.getByRole('alert')).toHaveText('Não foi possível carregar o catálogo.');
    await expectNoViolations(page);
  });
}

test('shows the error message when the connection drops during the request', async ({
  page,
  context,
}) => {
  let failRequest = () => {};
  const requestFailed = new Promise<void>((resolve) => {
    failRequest = resolve;
  });
  await page.route(ANILIST_ENDPOINT, async (route) => {
    await requestFailed;
    await route.abort();
  });
  await page.goto('/');
  await expect(page.getByTestId('catalog-skeleton')).toBeVisible();
  await context.setOffline(true);
  failRequest();
  await expect(page.getByRole('alert')).toBeVisible({ timeout: NETWORK_RETRIES_TIMEOUT });
});

test('shows the error message after the network retries fail', async ({ page }) => {
  await page.route(ANILIST_ENDPOINT, (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toBeVisible({ timeout: NETWORK_RETRIES_TIMEOUT });
});
