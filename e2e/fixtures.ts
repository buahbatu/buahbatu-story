import { test as base, expect, type Page } from '@playwright/test';

export interface GamePage {
  page: Page;
  problems: string[];
}

export const watchConsole = (page: Page, problems: string[]): void => {
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
};

export const test = base.extend<{ game: GamePage }>({
  game: async ({ page }, use) => {
    const problems: string[] = [];
    watchConsole(page, problems);
    await page.goto('/');
    await page.waitForFunction(() => window.__BB__ !== undefined);
    await page.evaluate(() => window.__BB__?.ready());
    await use({ page, problems });
    expect(problems, 'console browser wajib bersih dari error & warning').toEqual([]);
  },
});

export { expect };
