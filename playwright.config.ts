// E2E Playwright: dijalankan AI, bukan manual. Desain: docs/50-testing-deploy.md §1, §2, §5
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  // Baseline snapshot per project & OS: render font beda antara Windows (lokal) dan Linux (CI).
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  // WebGL di Chromium headless dirender CPU (SwiftShader). Perangkat dev (2 core, 4 GB) kewalahan
  // kalau paralel, jadi lokal 1 worker; CI memakai default.
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
    // Animasi CSS dimatikan lewat prefers-reduced-motion supaya snapshot stabil (docs/50 §2).
    reducedMotion: 'reduce',
    // Trace (screenshot beruntun) sangat berat untuk canvas WebGL → hanya saat retry pertama.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    },
    // HP landscape (docs/40 §7). Tinggi 360 = pas tinggi game.
    { name: 'android-landscape', use: { ...devices['Galaxy S24 landscape'] } },
    // Layar lebih pendek dari 360 (iPhone), diemulasikan di Chromium.
    { name: 'iphone-landscape', use: { ...devices['iPhone 15 landscape'], browserName: 'chromium' } },
  ],
  webServer: {
    // Build mode `test` = build produksi + test hook window.__BB__ (docs/50 §2).
    command: `npm run build:test && npx vite preview --outDir dist-test --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Selalu build & server baru: memakai server lama berarti menguji build basi (pernah terjadi).
    // Kalau port terpakai, tes gagal dengan jelas, bukan diam-diam memakai kode lama.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
