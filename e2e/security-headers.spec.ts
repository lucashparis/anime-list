import { expect, type Page } from '@playwright/test';
import { animeCatalogResponse } from '../src/test/animeCatalogFixture';
import { ANILIST_ENDPOINT, fulfillAnilist, test } from './support/anilist';
import { vercelHeaders } from './support/vercelHeaders';

const APP_ORIGIN = 'http://localhost:4173';
const EVIL_COVER = 'https://evil.example/cover.jpg';

function trackCspErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
      errors.push(message.text());
    }
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.route(`${APP_ORIGIN}/**`, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...vercelHeaders() } });
  });
});

test('serves the catalog, filter, search and load more without CSP violations', async ({
  page,
}) => {
  const errors = trackCspErrors(page);
  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
  const cards = page.getByRole('list', { name: 'Animes' }).getByRole('article');
  await expect(cards).toHaveCount(12);
  await page.getByRole('button', { name: 'Filme' }).click();
  await page.getByRole('searchbox').fill('naruto');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page).toHaveURL(/format=MOVIE&q=naruto/);
  await expect(cards).toHaveCount(12);
  await page.getByRole('button', { name: 'Ver mais' }).click();
  await expect(cards).toHaveCount(12);
  await page.evaluate(() => document.fonts.ready);
  const loadedFonts = await page.evaluate(
    () => [...document.fonts].filter((font) => font.status === 'loaded').length,
  );
  expect(loadedFonts).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('blocks an inline script', async ({ page }) => {
  const errors = trackCspErrors(page);
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  const executed = await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.injected = true;';
    document.head.append(script);
    return 'injected' in window;
  });
  expect(executed).toBe(false);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
});

test('does not load a cover from another origin', async ({ page }) => {
  const errors = trackCspErrors(page);
  const requestedHosts: string[] = [];
  page.on('request', (request) => requestedHosts.push(new URL(request.url()).host));
  const [first, ...rest] = animeCatalogResponse.data.Page.media;
  const withEvilCover = {
    data: {
      Page: {
        pageInfo: { hasNextPage: false },
        media: [{ ...first, coverImage: { large: EVIL_COVER, extraLarge: EVIL_COVER } }, ...rest],
      },
    },
  };
  await page.route(ANILIST_ENDPOINT, (route) => fulfillAnilist(route, { json: withEvilCover }));
  await page.goto('/');
  const cards = page.getByRole('list', { name: 'Animes' }).getByRole('article');
  await expect(cards).toHaveCount(12);
  await expect(cards.first().locator('img')).toHaveCount(0);
  await expect(cards.first()).toHaveCSS('background-color', 'rgb(26, 26, 26)');
  expect(requestedHosts).not.toContain('evil.example');
  expect(errors).toEqual([]);
});
