import { expect, test } from './fixtures';

for (const [name, x, y, yaw, zoom] of [
  ['jalan-buahbatu', 26, 14, 0.7, 1.5],
  ['jalan-ujung-barat', 3, 14.5, -0.9, 1.6],
  ['tepi-utara', 22, 4, 0, 1.6],
] as const)
  test(`snapshot ${name}`, async ({ game: { page } }) => {
    await page.evaluate(
      async ([px, py, cy, cz]) => {
        await window.__BB__?.enterArea('buahbatu', 'start');
        window.__BB__?.placePlayer(px, py, 's');
        window.__BB__?.setCamera({ yaw: cy, zoom: cz });
        window.__BB__?.freeze(true);
      },
      [x, y, yaw, zoom] as const,
    );
    await expect(page).toHaveScreenshot(`${name}.png`);
  });
