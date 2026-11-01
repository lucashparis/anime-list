import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type Route } from '@playwright/test';
import { animeCatalogResponse, pagedCatalogResponse } from '../src/test/animeCatalogFixture';
import { ANILIST_ENDPOINT, fulfillAnilist, test } from './support/anilist';
import { requestedVariables } from './support/requestedVariables';
import { WCAG_TAGS } from './support/screens';

const WIDTHS = [320, 768, 1366];

function loadMore(page: Page) {
  return page.getByRole('button', { name: 'Ver mais' });
}

function cards(page: Page) {
  return page.getByRole('list', { name: 'Animes' }).getByRole('article');
}

function pageOf(route: Route) {
  return Number(requestedVariables(route)['page']);
}

async function servePages(page: Page, onSecondPage: (route: Route) => Promise<void>) {
  await page.route(ANILIST_ENDPOINT, (route) => {
    if (pageOf(route) === 1) return fulfillAnilist(route, { json: animeCatalogResponse });
    return onSecondPage(route);
  });
}

function lastPage(route: Route) {
  return fulfillAnilist(route, { json: pagedCatalogResponse(2, false) });
}

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
}

for (const width of WIDTHS) {
  test.describe(`load more at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('appends the next page without horizontal scroll or violations', async ({ page }) => {
      await servePages(page, lastPage);
      await page.goto('/');
      await expect(cards(page)).toHaveCount(12);
      await expectNoViolations(page);
      await loadMore(page).click();
      await expect(cards(page)).toHaveCount(24);
      await expect(loadMore(page)).toHaveCount(0);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      await expectNoViolations(page);
      await page.screenshot({
        path: `test-results/load-more/${String(width)}.png`,
        fullPage: true,
      });
    });

    test('shows the button before loading more', async ({ page }) => {
      await servePages(page, lastPage);
      await page.goto('/');
      await expect(loadMore(page)).toBeVisible();
      await loadMore(page).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `test-results/load-more/${String(width)}-button.png` });
    });
  });
}

test('shows skeletons while loading, keeps focus and sends one request', async ({ page }) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let secondPageRequests = 0;
  await servePages(page, async (route) => {
    secondPageRequests += 1;
    await released;
    await lastPage(route);
  });
  await page.goto('/');
  await loadMore(page).click();
  await expect(page.getByTestId('catalog-skeleton').locator('> div')).toHaveCount(12);
  await expect(loadMore(page)).toHaveAttribute('aria-disabled', 'true');
  await loadMore(page).click({ force: true });
  release();
  await expect(cards(page)).toHaveCount(24);
  await expect(page.getByRole('status')).toHaveText('12 animes carregados');
  expect(secondPageRequests).toBe(1);
});

test('keeps the cards when loading more fails and retries', async ({ page }) => {
  let fail = true;
  await servePages(page, (route) =>
    fail ? fulfillAnilist(route, { status: 400, json: {} }) : lastPage(route),
  );
  await page.goto('/');
  await loadMore(page).click();
  await expect(page.getByRole('alert')).toHaveText('Não foi possível carregar mais animes.');
  await expect(cards(page)).toHaveCount(12);
  await expectNoViolations(page);
  fail = false;
  await loadMore(page).click();
  await expect(cards(page)).toHaveCount(24);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('keeps format and search on the next page', async ({ page }) => {
  const variables: Record<string, unknown>[] = [];
  await servePages(page, lastPage);
  await page.route(ANILIST_ENDPOINT, async (route) => {
    variables.push(requestedVariables(route));
    await route.fallback();
  });
  await page.goto('/?format=OVA&q=naruto');
  await loadMore(page).click();
  await expect(cards(page)).toHaveCount(24);
  expect(variables.at(-1)).toMatchObject({ page: 2, format: 'OVA', search: 'naruto' });
});
