import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const dialog = (page: Page) => page.evaluate(() => window.__BB__?.dialog() ?? null);
const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);
const box = (page: Page) => page.locator('.dialog-box');

async function untilChoices(page: Page, step: () => Promise<void>) {
  const choices = box(page).locator('.dialog-choices li');
  for (let i = 0; i < 12 && (await choices.count()) === 0; i++) {
    await step();
    await page.waitForTimeout(120);
  }
  await expect(choices).toHaveCount(3);
}

async function openBoard(page: Page) {
  await page.evaluate(async () => {
    await window.__BB__?.enterArea('lembang');
    window.__BB__?.placePlayer(13.5, 22.3, 'n');
  });
  await expect.poll(async () => (await page.evaluate(() => window.__BB__?.prompt()))?.text).toBe('prompt.read');
  await page.keyboard.press('KeyE');
  await expect(box(page)).toBeVisible();
}

test('baca papan: teks mengetik, E mempercepat & lanjut, pilihan, dialog lanjutan, log', async ({ game: { page } }) => {
  await openBoard(page);
  await expect(box(page).locator('.dialog-name')).toHaveText('Papan Pengumuman');
  await expect(page.locator('.interact-prompt')).toHaveCount(0);
  const text = box(page).locator('.dialog-text');
  await expect.poll(async () => (await text.textContent())?.length ?? 0).toBeGreaterThan(0);
  const partial = (await text.textContent()) ?? '';
  expect(partial.length).toBeLessThan(70);

  await page.keyboard.press('KeyE');
  await expect
    .poll(async () => ((await dialog(page))?.line ?? 0) > 0 || ((await text.textContent()) ?? '').includes('asal dirawat ya!'))
    .toBe(true);
  await untilChoices(page, () => page.keyboard.press('KeyE'));
  const choices = box(page).locator('.dialog-choices li');
  await expect(choices.nth(0)).toHaveClass(/selected/);
  await page.keyboard.press('ArrowDown');
  await expect(choices.nth(1)).toHaveClass(/selected/);
  await page.keyboard.press('Digit1');
  await expect.poll(async () => (await dialog(page))?.dialogId).toBe('board_kebun_warga_siap');
  await page.keyboard.press('KeyE');
  await expect(text).toHaveText(/Hatur nuhun, Kamu! Kebunnya pasti makin subur\./);
  await page.keyboard.press('KeyE');
  await expect(box(page)).toHaveCount(0);
  await expect.poll(async () => (await dialog(page))?.open).toBe(false);

  await page.keyboard.press('KeyL');
  const log = page.locator('.dialog-log');
  await expect(log).toContainText('Kamu: Siap, nanti aku bantu siram!');
  await expect(log).toContainText('Papan Pengumuman: KEBUN WARGA LEMBANG');
  await page.keyboard.press('KeyL');
  await expect(log).toHaveCount(0);
});

test('selama dialog pemain diam; klik kotak dialog melanjutkan; pilihan bisa diklik', async ({ game: { page } }) => {
  await openBoard(page);
  const before = await player(page);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyD');
  expect((await player(page))?.x).toBe(before?.x);
  await untilChoices(page, () => box(page).click());
  await box(page).locator('.dialog-choices li').nth(2).click();
  await expect(box(page)).toHaveCount(0);
});

test('snapshot kotak dialog dengan pilihan', async ({ game: { page } }) => {
  await openBoard(page);
  await untilChoices(page, () => page.keyboard.press('KeyE'));
  await page.evaluate(() => window.__BB__?.freeze(true));
  await expect(page).toHaveScreenshot('dialog-pilihan.png');
});
