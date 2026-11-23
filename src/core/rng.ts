export interface RngHolder {
  rngState: number;
}

export function nextFloat(state: number): [value: number, next: number] {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

export function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0;
}

export interface WeightedEntry<T> {
  value: T;
  weight: number;
}

export interface Rng {
  float(): number;
  int(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T | undefined;
  weighted<T>(entries: readonly WeightedEntry<T>[]): T | undefined;
}

export function createRng(holder: RngHolder): Rng {
  const float = () => {
    const [value, next] = nextFloat(holder.rngState);
    holder.rngState = next;
    return value;
  };
  const int = (min: number, max: number) => {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(float() * (hi - lo + 1));
  };
  return {
    float,
    int,
    chance: (p) => float() < p,
    pick: (items) => (items.length === 0 ? undefined : items[int(0, items.length - 1)]),
    weighted: (entries) => {
      const valid = entries.filter((e) => e.weight > 0 && Number.isFinite(e.weight));
      const total = valid.reduce((sum, e) => sum + e.weight, 0);
      if (total <= 0) return undefined;
      let roll = float() * total;
      for (const entry of valid) {
        roll -= entry.weight;
        if (roll < 0) return entry.value;
      }
      return valid[valid.length - 1]?.value;
    },
  };
}
