import { test as base, expect, type Page } from '@playwright/test';

export interface GamePage {
  page: Page;
  errors: string[];
}

export const test = base.extend<{ game: GamePage }>({
  game: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    await page.goto('/');
    await page.waitForFunction(() => window.__BB__ !== undefined);
    await page.evaluate(() => window.__BB__?.ready());
    await use({ page, errors });
  },
});

export { expect };
