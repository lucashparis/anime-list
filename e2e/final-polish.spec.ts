import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { ANILIST_ENDPOINT, test } from './support/anilist';
import { WCAG_TAGS } from './support/screens';

const WIDTHS = [320, 768, 1366];

function cards(page: Page) {
  return page.getByRole('list', { name: 'Animes' }).getByRole('article');
}

function searchBox(page: Page) {
  return page.getByRole('searchbox', { name: 'Buscar anime' });
}

async function cssOf(page: Page, selector: string, property: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);
}

for (const width of WIDTHS) {
  test.describe(`final polish at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('has clickable cards without violations or horizontal scroll', async ({ page }) => {
      await page.goto('/');
      await expect(cards(page)).toHaveCount(12);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations).toEqual([]);
    });
  });
}

test('opens the AniList page of the card in a new tab', async ({ page, context }) => {
  await context.route('https://anilist.co/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>AniList</title>' }),
  );
  await page.goto('/');
  const newTab = context.waitForEvent('page');
  await cards(page)
    .first()
    .click({ position: { x: 20, y: 200 } });
  const opened = await newTab;
  expect(opened.url()).toBe('https://anilist.co/anime/1');
  await expect(page).toHaveURL(/\/$/);
});

test('shows the hand cursor and lifts the card on hover', async ({ page }) => {
  await page.goto('/');
  const card = cards(page).first();
  await expect(card).toBeVisible();
  await card.hover({ position: { x: 20, y: 200 } });
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).translate)).not.toBe('none');
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  expect(await cssOf(page, 'article a', 'cursor')).toBe('pointer');
  const cover = card.locator('img');
  await expect.poll(() => cover.evaluate((el) => getComputedStyle(el).scale)).not.toBe('none');
});

test('shows the hand cursor on buttons and not on disabled ones', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
  expect(await cssOf(page, 'button', 'cursor')).toBe('pointer');
  const more = page.getByRole('button', { name: 'Ver mais' });
  await more.evaluate((el) => {
    el.setAttribute('aria-disabled', 'true');
  });
  expect(await more.evaluate((el) => getComputedStyle(el).cursor)).toBe('not-allowed');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps the cards and covers still on hover', async ({ page }) => {
    await page.goto('/');
    const card = cards(page).first();
    await card.hover({ position: { x: 20, y: 200 } });
    await page.waitForTimeout(300);
    expect(await card.evaluate((el) => getComputedStyle(el).translate)).toBe('none');
    expect(await card.locator('img').evaluate((el) => getComputedStyle(el).scale)).toBe('none');
  });
});

test('keeps the focus on the search field and updates the tab title', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page)).toHaveCount(12);
  await searchBox(page).fill('naruto');
  await searchBox(page).press('Enter');
  await expect(page).toHaveURL(/\?q=naruto$/);
  await expect(searchBox(page)).toBeFocused();
  await expect(page).toHaveTitle('BuscAnime: catálogo de animes · “naruto”');
});

test('limits a huge search from the URL to 100 characters', async ({ page }) => {
  let sent = '';
  await page.route(ANILIST_ENDPOINT, async (route) => {
    sent = JSON.stringify(route.request().postDataJSON());
    await route.fallback();
  });
  await page.goto(`/?q=${'a'.repeat(10_000)}`);
  await expect(searchBox(page)).toHaveValue('a'.repeat(100));
  expect(sent).toContain(`"search":"${'a'.repeat(100)}"`);
  expect(sent).not.toContain('a'.repeat(101));
});
