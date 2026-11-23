import { defineConfig, devices } from '@playwright/test';

const url = process.env.DEPLOY_URL;
if (!url) throw new Error('DEPLOY_URL wajib diisi');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: 'e2e-deploy',
  outputDir: 'test-results',
  retries: 2,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    launchOptions: { args: ['--use-angle=swiftshader'] },
    baseURL: url,
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : {},
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } },
    { name: 'android-landscape', use: { ...devices['Galaxy S24 landscape'] } },
  ],
});
