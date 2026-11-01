import { expect } from '@playwright/test';
import { test } from './support/anilist';

const ASSETS = [
  { path: '/favicon.svg', type: 'image/svg+xml' },
  { path: '/favicon.ico', type: /image\/(x-icon|vnd\.microsoft\.icon)/ },
  { path: '/apple-touch-icon.png', type: 'image/png' },
  { path: '/og-image.png', type: 'image/png' },
  { path: '/robots.txt', type: 'text/plain' },
];

for (const { path, type } of ASSETS) {
  test(`serves ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(type);
  });
}

test('loads the page with the icons declared and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Animes' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('declares the preview image and the page language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://anime-list-silk.vercel.app/og-image.png',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
