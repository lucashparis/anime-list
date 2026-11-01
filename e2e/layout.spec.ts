import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SCREENS = [
  { name: 'phone-320', width: 320, height: 568 },
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'zoom-200', width: 683, height: 384, deviceScaleFactor: 2 },
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const NOTICE = 'Aviso de privacidade';
const HEADER_HEIGHT = 68;
const SKELETON_BLOCKS = '[data-testid="page-skeleton"] .min-h-card';

for (const screen of SCREENS) {
  const { name, width, height } = screen;
  const deviceScaleFactor = 'deviceScaleFactor' in screen ? screen.deviceScaleFactor : 1;

  test.describe(name, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor });

    test(`${name}: fits the screen with the privacy notice open`, async ({ page }) => {
      await page.goto('/');
      await page.getByText(NOTICE).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      await page.screenshot({ path: `test-results/layout/${name}.png`, fullPage: true });
    });

    test(`${name}: keeps the header at 68px`, async ({ page }) => {
      await page.goto('/');
      const box = await page.locator('header').boundingBox();
      expect(box?.height).toBe(HEADER_HEIGHT);
    });

    test(`${name}: has no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto('/');
      await page.getByText(NOTICE).click();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations).toEqual([]);
    });
  });
}

test('declares the page language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the skeleton without JavaScript', async ({ page }) => {
    await page.goto('/');
    const skeleton = page.getByTestId('page-skeleton');
    await expect(skeleton).toBeVisible();
    const box = await skeleton.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
    const message = page.locator('noscript p');
    await expect(message).toBeVisible();
    await expect(message).toHaveText('Ative o JavaScript para ver o catálogo do BuscAnime.');
  });

  test('animates the skeleton by default', async ({ page }) => {
    await page.goto('/');
    const names = await page
      .locator(SKELETON_BLOCKS)
      .evaluateAll((blocks) => blocks.map((block) => getComputedStyle(block).animationName));
    expect(names).toHaveLength(8);
    for (const animationName of names) {
      expect(animationName).not.toBe('none');
    }
  });
});

test.describe('with reduced motion', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('does not animate for reduced motion', async ({ page }) => {
    await page.goto('/');
    const names = await page
      .locator(SKELETON_BLOCKS)
      .evaluateAll((blocks) => blocks.map((block) => getComputedStyle(block).animationName));
    expect(names).toHaveLength(8);
    for (const animationName of names) {
      expect(animationName).toBe('none');
    }
  });
});

test('replaces the skeleton after mounting', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('page-skeleton')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('tall screens', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('keeps the footer at the bottom of tall screens', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('footer').boundingBox();
    const innerHeight = await page.evaluate(() => window.innerHeight);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(innerHeight);
  });
});

test('reaches the content by keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press('Enter');
  const main = page.getByRole('main');
  await expect(main).toBeFocused();
  await expect(main).toHaveCSS('outline-style', 'none');
});

test('keeps the header in place when the skip link appears', async ({ page }) => {
  await page.goto('/');
  const before = await page.locator('header').boundingBox();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  const after = await page.locator('header').boundingBox();
  expect(after?.y).toBe(before?.y);
});

test('shows focus outlines on the link and the summary', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const link = page.getByRole('link', { name: 'AniList' });
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(link).toHaveCSS('outline-width', '2px');
  await page.keyboard.press('Tab');
  const summary = page.getByText(NOTICE);
  await expect(summary).toBeFocused();
  await expect(summary).toHaveCSS('outline-style', 'solid');
  await expect(summary).toHaveCSS('outline-width', '2px');
});

test('keeps the native disclosure marker on the summary', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(NOTICE)).toHaveCSS('display', 'list-item');
});

test.describe('touch devices', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('gives touch targets 44px', async ({ page }) => {
    await page.goto('/');
    const link = await page.getByRole('link', { name: 'AniList' }).boundingBox();
    const summary = await page.getByText(NOTICE).boundingBox();
    expect(link?.height).toBeGreaterThanOrEqual(44);
    expect(summary?.height).toBeGreaterThanOrEqual(44);
  });
});
