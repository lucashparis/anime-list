import { expect, test } from '@playwright/test';

const SLOW_LOAD_WAIT = 9_000;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('does not show the slow-load message without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(SLOW_LOAD_WAIT);
    await expect(page.getByTestId('slow-load-message')).not.toBeVisible();
    await expect(page.locator('noscript p')).toBeVisible();
  });
});
