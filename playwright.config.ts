import { defineConfig, devices } from '@playwright/test';

const ORIGIN = 'http://localhost:4173';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results/playwright',
  use: { baseURL: ORIGIN },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: ORIGIN,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
