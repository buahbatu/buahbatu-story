// Smoke: game boot sampai layar judul, test hook bekerja, Command lewat jalur yang sama dengan pemain.
// Desain: docs/50-testing-deploy.md §1–2, docs/02-arsitektur.md §4
import { expect, test } from './fixtures';

test('boot → Preload → Title tanpa error', async ({ game: { page, errors } }) => {
  expect(await page.evaluate(() => window.__BB__?.scene())).toBe('Title');
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect(page.locator('.version-badge')).toHaveText(/^Versi \d+\.\d+\.\d+$/);
  await expect(page).toHaveTitle('Buahbatu Story');
  expect(errors).toEqual([]);
});

test('font pixel termuat (bukan font cadangan)', async ({ game: { page } }) => {
  const loaded = await page.evaluate(() => ({
    body: document.fonts.check('16px "Pixelify Sans"'),
    title: document.fonts.check('16px "Press Start 2P"'),
  }));
  expect(loaded).toEqual({ body: true, title: true });
});

test('Command lewat test hook mengubah state & bisa ditolak', async ({ game: { page } }) => {
  const result = await page.evaluate(() => {
    const bb = window.__BB__;
    if (!bb) throw new Error('hook tidak ada');
    const ok = bb.dispatch({ type: 'world/setFlag', by: 'A', key: 'e2e.met', value: true });
    const bad = bb.dispatch({ type: 'world/setFlag', by: 'A', key: '', value: true });
    return { ok: ok.ok, events: ok.events.length, bad, flag: bb.getState().world.flags['e2e.met'] };
  });
  expect(result).toMatchObject({
    ok: true,
    events: 1,
    flag: true,
    bad: { ok: false, reason: 'error.invalidCommand' },
  });
});

test('setSeed membuat dunia deterministik', async ({ game: { page } }) => {
  const seeds = await page.evaluate(() => {
    const bb = window.__BB__;
    bb?.setSeed(42);
    const a = bb?.getState().world.rngState;
    bb?.setSeed(7);
    return [a, bb?.getState().world.rngState];
  });
  expect(seeds).toEqual([42, 7]);
});

test('toast dari EventBus tampil di overlay', async ({ game: { page } }) => {
  await page.evaluate(() => window.__BB__?.emit({ type: 'ui/toast', key: 'error.internal' }));
  await expect(page.locator('.toast')).toHaveText('Waduh, ada yang error. Progresmu aman, coba ulangi.');
});
