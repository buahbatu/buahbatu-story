export interface WetRules {
  dryTime: number;
  dripTime: number;
  dripRate: number;
}

export interface WetState {
  inWater: boolean;
  wetness: number;
  dripLeft: number;
  dripAcc: number;
}

export const DRY: WetState = { inWater: false, wetness: 0, dripLeft: 0, dripAcc: 0 };

export function stepWet(s: WetState, inWater: boolean, dt: number, rules: WetRules): { state: WetState; splash: boolean; drips: number } {
  const splash = inWater && !s.inWater;
  if (inWater) return { state: { inWater, wetness: 1, dripLeft: rules.dripTime, dripAcc: 0 }, splash, drips: 0 };
  const dripLeft = Math.max(0, s.dripLeft - dt);
  const acc = s.dripAcc + (dripLeft > 0 ? rules.dripRate * (dripLeft / rules.dripTime) * dt : 0);
  const drips = Math.floor(acc);
  return {
    state: { inWater, wetness: Math.max(0, s.wetness - dt / rules.dryTime), dripLeft, dripAcc: acc - drips },
    splash,
    drips,
  };
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  floor: number;
  life: number;
}

export function stepParticles(list: readonly Particle[], dt: number, gravity: number): Particle[] {
  const out: Particle[] = [];
  for (const p of list) {
    const life = p.life - dt;
    if (life <= 0) continue;
    const vy = p.vy - gravity * dt;
    const y = p.y + vy * dt;
    if (y <= p.floor) continue;
    out.push({ ...p, x: p.x + p.vx * dt, y, z: p.z + p.vz * dt, vy, life });
  }
  return out;
}

export function seeded(seed: number): () => number {
  let s = Math.floor(Math.abs(seed) * 2654435761) % 2147483647 || 1;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}

export function splashBurst(x: number, surface: number, z: number, count: number, rnd: () => number): Particle[] {
  return Array.from({ length: count }, () => {
    const a = rnd() * Math.PI * 2;
    const speed = 0.8 + rnd() * 1.4;
    return {
      x,
      y: surface + 0.05,
      z,
      vx: Math.cos(a) * speed,
      vy: 2.2 + rnd() * 2,
      vz: Math.sin(a) * speed,
      floor: surface - 0.05,
      life: 1.2,
    };
  });
}

export function drip(x: number, ground: number, z: number, rnd: () => number): Particle {
  const a = rnd() * Math.PI * 2;
  const r = 0.28 + rnd() * 0.16;
  return {
    x: x + Math.cos(a) * r,
    y: ground + 0.35 + rnd() * 0.9,
    z: z + Math.sin(a) * r,
    vx: 0,
    vy: 0,
    vz: 0,
    floor: ground + 0.02,
    life: 2,
  };
}
