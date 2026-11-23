import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  workers: CI ? undefined : 1,
  timeout: 60_000,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.002 },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    },
    { name: 'android-landscape', use: { ...devices['Galaxy S24 landscape'] } },
    { name: 'iphone-landscape', use: { ...devices['iPhone 15 landscape'], browserName: 'chromium' } },
  ],
  webServer: {
    command: `npm run build:test && npx vite preview --outDir dist-test --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
