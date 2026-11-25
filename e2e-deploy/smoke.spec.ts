import { expect, test } from '@playwright/test';

test('URL deploy menampilkan layar judul tanpa error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`));
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Buahbatu Story');
  await expect(page.locator('#game canvas')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.version-badge')).toHaveText(/^Versi \d+\.\d+\.\d+$/, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__BB__)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('aset statis & header keamanan', async ({ request }) => {
  const font = await request.get('/assets/fonts/press-start-2p-400.woff2');
  expect(font.status()).toBe(200);
  const home = await request.get('/');
  expect(home.headers()['x-content-type-options']).toBe('nosniff');
  expect(home.headers()['x-frame-options']).toBe('DENY');
});

test('pratinjau ?area=sandbox memuat peta, atlas & model 3D tanpa error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`));
  const map = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/assets/maps/sandbox.tmj'));
  const atlas = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/assets/tilesets/ground.png'));
  const tree = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith('/assets/models/nature/tree_oak.glb'));
  await page.goto('/?area=sandbox');
  expect((await map).status()).toBe(200);
  expect((await atlas).status()).toBe(200);
  expect((await tree).status()).toBe(200);
  for (const r of [await map, await atlas, await tree]) {
    expect(new URL(r.url()).searchParams.get('v')).toMatch(/^[0-9a-f]{10}$/);
    expect(r.headers()['cache-control']).toContain('immutable');
  }
  await expect(page.locator('#game canvas')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.fatal')).toHaveCount(0);
  expect(errors).toEqual([]);
});
