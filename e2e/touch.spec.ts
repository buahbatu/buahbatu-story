import type { CDPSession, Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const player = (page: Page) => page.evaluate(() => window.__BB__?.player() ?? null);

async function centerOf(target: Locator) {
  const box = await target.boundingBox();
  if (!box) throw new Error('elemen tidak terlihat');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const touch = (cdp: CDPSession, type: 'touchStart' | 'touchMove' | 'touchEnd', points: { x: number; y: number; id: number }[]) =>
  cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });

function sawJump(page: Page) {
  return page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const until = performance.now() + 3000;
        const check = () => {
          if (window.__BB__?.player()?.anim === 'jump') resolve(true);
          else if (performance.now() > until) resolve(false);
          else requestAnimationFrame(check);
        };
        check();
      }),
  );
}

test.describe('kontrol sentuh di HP/tablet', () => {
  test.skip(({ isMobile }) => !isMobile, 'khusus perangkat sentuh');

  test('joystick tetap di tempat: geser sedikit = jalan, penuh = lari, lepas = berhenti', async ({ game: { page } }) => {
    await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
    await expect(page.locator('.touch-controls')).toBeVisible();
    const cdp = await page.context().newCDPSession(page);
    const stick = page.locator('.touch-stick');
    const before = await stick.boundingBox();
    const c = await centerOf(stick);
    const a = await player(page);
    await touch(cdp, 'touchStart', [{ ...c, id: 1 }]);
    await touch(cdp, 'touchMove', [{ ...c, x: c.x + 22, id: 1 }]);
    await expect.poll(async () => (await player(page))?.anim).toBe('walk');
    await touch(cdp, 'touchMove', [{ ...c, x: c.x + 120, id: 1 }]);
    await expect.poll(async () => (await player(page))?.anim).toBe('run');
    await expect.poll(async () => ((await player(page))?.x ?? 0) - (a?.x ?? 0), { timeout: 10_000 }).toBeGreaterThan(1);
    await expect(page.locator('.touch-stick.active')).toBeVisible();
    expect(await stick.boundingBox()).toEqual(before);
    await touch(cdp, 'touchEnd', []);
    await expect.poll(async () => (await player(page))?.anim).toBe('idle');
    await expect(page.locator('.touch-stick.active')).toHaveCount(0);
  });

  test('tahan tombol Lari + joystick sedikit = lari', async ({ game: { page } }) => {
    await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
    const cdp = await page.context().newCDPSession(page);
    const c = await centerOf(page.locator('.touch-stick'));
    const run = await centerOf(page.locator('.touch-run'));
    await touch(cdp, 'touchStart', [
      { ...c, id: 1 },
      { ...run, id: 2 },
    ]);
    await touch(cdp, 'touchMove', [
      { ...c, x: c.x + 22, id: 1 },
      { ...run, id: 2 },
    ]);
    await expect.poll(async () => (await player(page))?.anim).toBe('run');
    await touch(cdp, 'touchEnd', []);
    await expect.poll(async () => (await player(page))?.anim).toBe('idle');
  });

  test('tombol Aksi berinteraksi & prompt memakai ikon tangan, tombol Lompat melompat', async ({ game: { page } }) => {
    await page.evaluate(async () => {
      await window.__BB__?.enterArea('kos_a', 'pintu');
      window.__BB__?.placePlayer(2.6, 2.2, 'w');
    });
    const prompt = page.locator('.interact-prompt');
    await expect(prompt).toHaveText('Tidur');
    await expect(prompt.locator('.key-cap svg')).toHaveCount(1);
    await page.locator('.touch-interact').tap();
    await expect.poll(() => page.evaluate(() => window.__BB__?.interactions() ?? [])).toMatchObject([{ action: 'bed' }]);
    await page.evaluate(() => window.__BB__?.placePlayer(5, 3.4, 's'));
    const cdp = await page.context().newCDPSession(page);
    const jump = await centerOf(page.locator('.touch-jump'));
    const saw = sawJump(page);
    await touch(cdp, 'touchStart', [{ ...jump, id: 3 }]);
    expect(await saw).toBe(true);
    await touch(cdp, 'touchEnd', []);
  });

  test('kontrol sentuh disembunyikan selama dialog', async ({ game: { page } }) => {
    await page.evaluate(async () => {
      await window.__BB__?.enterArea('lembang');
      window.__BB__?.placePlayer(13.5, 22.3, 'n');
    });
    await expect(page.locator('.touch-controls')).toBeVisible();
    await page.locator('.touch-interact').tap();
    await expect(page.locator('.dialog-box')).toBeVisible();
    await expect(page.locator('.touch-controls')).toHaveCount(0);
    for (let i = 0; i < 12 && (await page.locator('.dialog-box').count()) > 0; i++) {
      const choices = page.locator('.dialog-choices li');
      if ((await choices.count()) > 0) await choices.last().dispatchEvent('click');
      else await page.locator('.dialog-box').tap();
      await page.waitForTimeout(120);
    }
    await expect(page.locator('.touch-controls')).toBeVisible();
  });

  test('pakai keyboard (mis. iPad + keyboard) menyembunyikan kontrol, sentuh lagi memunculkannya', async ({ game: { page } }) => {
    await page.evaluate(() => window.__BB__?.enterArea('sandbox', 'depan_rumah'));
    await expect(page.locator('.touch-controls')).toBeVisible();
    await page.keyboard.press('KeyD');
    await expect(page.locator('.touch-controls')).toHaveCount(0);
    await page.touchscreen.tap(300, 150);
    await expect(page.locator('.touch-controls')).toBeVisible();
  });

  test('snapshot kontrol sentuh', async ({ game: { page } }) => {
    await page.evaluate(async () => {
      await window.__BB__?.enterArea('sandbox', 'depan_rumah');
      window.__BB__?.freeze(true);
    });
    await expect(page.locator('.touch-buttons')).toBeVisible();
    await expect(page).toHaveScreenshot('kontrol-sentuh.png');
  });
});

test('desktop: kontrol sentuh tidak tampil, muncul otomatis bila layar disentuh, hilang lagi saat mouse dipakai', async ({
  game: { page },
  isMobile,
}) => {
  test.skip(isMobile, 'khusus desktop');
  await page.evaluate(() => window.__BB__?.enterArea('sandbox'));
  await expect(page.locator('.touch-controls')).toHaveCount(0);
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', clientX: 200, clientY: 200 }));
  });
  await expect(page.locator('.touch-controls')).toBeVisible();
  await page.mouse.move(100, 100);
  await page.mouse.move(400, 300, { steps: 4 });
  await expect(page.locator('.touch-controls')).toHaveCount(0);
});
