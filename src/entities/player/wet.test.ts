import { describe, expect, it } from 'vitest';
import { DRY, drip, seeded, splashBurst, stepParticles, stepWet, type WetState } from './wet';

const rules = { dryTime: 6, dripTime: 4, dripRate: 12 };

describe('stepWet', () => {
  it('cipratan sekali saat masuk air, basah penuh selama di air', () => {
    const a = stepWet(DRY, true, 0.1, rules);
    expect(a.splash).toBe(true);
    expect(a.state.wetness).toBe(1);
    const b = stepWet(a.state, true, 0.1, rules);
    expect(b.splash).toBe(false);
    expect(b.drips).toBe(0);
  });

  it('setelah naik ke darat menetes beberapa detik lalu berhenti, dan mengering pelan', () => {
    let s: WetState = stepWet(DRY, true, 0.1, rules).state;
    let drips = 0;
    let t = 0;
    let lastDrip = 0;
    while (t < 10) {
      const r = stepWet(s, false, 0.05, rules);
      s = r.state;
      drips += r.drips;
      if (r.drips > 0) lastDrip = t;
      t += 0.05;
    }
    expect(drips).toBeGreaterThan(10);
    expect(lastDrip).toBeLessThan(rules.dripTime);
    expect(s.wetness).toBe(0);
    expect(stepWet({ ...s, wetness: 1 }, false, 3, rules).state.wetness).toBeCloseTo(0.5);
  });
});

describe('partikel', () => {
  it('cipratan melompat ke atas lalu jatuh dan hilang di permukaan air', () => {
    let ps = splashBurst(0, 0, 0, 10, seeded(1));
    expect(ps).toHaveLength(10);
    ps = stepParticles(ps, 0.1, 9.8);
    expect(ps.every((p) => p.y > 0)).toBe(true);
    for (let i = 0; i < 30; i++) ps = stepParticles(ps, 0.05, 9.8);
    expect(ps).toHaveLength(0);
  });

  it('tetesan muncul di sekitar badan dan jatuh ke tanah', () => {
    const d = drip(5, 1, 5, seeded(2));
    expect(Math.hypot(d.x - 5, d.z - 5)).toBeGreaterThanOrEqual(0.28);
    expect(Math.hypot(d.x - 5, d.z - 5)).toBeLessThan(0.45);
    expect(d.y).toBeGreaterThan(1.3);
    let ps = [d];
    for (let i = 0; i < 40; i++) ps = stepParticles(ps, 0.05, 9.8);
    expect(ps).toHaveLength(0);
  });

  it('acak berbibit selalu sama', () => {
    expect([seeded(7)(), seeded(7)()]).toEqual([seeded(7)(), seeded(7)()]);
  });
});
