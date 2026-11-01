import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { ANILIST_ENDPOINT, test } from './support/anilist';
import { requestedVariables } from './support/requestedVariables';
import { WCAG_TAGS } from './support/screens';

const WIDTHS = [320, 768, 1366];

function formatButton(page: Page, name: string) {
  return page.getByRole('group', { name: 'Formato' }).getByRole('button', { name });
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

for (const width of WIDTHS) {
  test.describe(`format filter at ${String(width)}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('fits the screen and has no WCAG 2.2 AA violations', async ({ page }) => {
      await page.goto('/?format=MOVIE');
      await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations).toEqual([]);
      await page.screenshot({ path: `test-results/format-filter/${String(width)}.png` });
    });
  });
}

test('sends the chosen format, updates the URL and goes back', async ({ page }) => {
  const formats: unknown[] = [];
  await page.route(ANILIST_ENDPOINT, async (route) => {
    formats.push(requestedVariables(route)['format']);
    await route.fallback();
  });
  await page.goto('/');
  await expect(formatButton(page, 'Todos os formatos')).toHaveAttribute('aria-pressed', 'true');
  await formatButton(page, 'Filme').click();
  await expect(page).toHaveURL(/\?format=MOVIE$/);
  await expect(formatButton(page, 'Filme')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  await page.goBack();
  await expect(formatButton(page, 'Todos os formatos')).toHaveAttribute('aria-pressed', 'true');
  expect(formats).toEqual([undefined, 'MOVIE']);
});

test('can be used with the keyboard', async ({ page }) => {
  await page.goto('/');
  await formatButton(page, 'Todos os formatos').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(formatButton(page, 'Série de TV')).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\?format=TV$/);
});
