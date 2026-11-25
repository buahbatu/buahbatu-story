import { expect, test } from './fixtures';

for (const [area, spawn, maxCalls] of [
  ['sandbox', 'start', 100],
  ['lembang', 'start', 150],
  ['buahbatu', 'start', 300],
  ['rumah_michelle', 'pintu', 150],
] as const)
  test(`anggaran draw call ${area} ≤ ${String(maxCalls)} (geometri statis digabung, ADR-030)`, async ({ game: { page } }, info) => {
    test.skip(info.project.name !== 'desktop', 'cukup sekali per area');
    await page.evaluate(([a, s]) => window.__BB__?.enterArea(a, s), [area, spawn] as const);
    await page.waitForTimeout(500);
    const stats = await page.evaluate(() => window.__BB__?.renderStats());
    expect(stats?.calls).toBeGreaterThan(0);
    expect(stats?.calls).toBeLessThanOrEqual(maxCalls);
  });
