import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/design',
  fullyParallel: true,
  workers: 3,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.QA_BASE_URL ?? 'http://localhost:3000',
    locale: 'he-IL',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.QA_BASE_URL ? undefined : {
    command: 'npm run start -- --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
