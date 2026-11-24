import { FURNITURE, PROP_ASSETS, type PropModel } from '../../config/world';

export const pickIndex = (count: number, seed: number): number => (count <= 0 ? 0 : Math.min(count - 1, Math.floor(seed * count)));

export const varied = (seed: number, amount: number): number => 1 + amount * (2 * ((seed * 7.31) % 1) - 1);

export const fitScale = (size: number, target: number): number => (size > 0 ? target / size : 1);

export function fenceLayout(length: number, segment: number): { count: number; stretch: number; offsets: number[] } {
  const count = Math.max(1, Math.round(length / Math.max(segment, 0.01)));
  const step = length / count;
  return { count, stretch: step / segment, offsets: Array.from({ length: count }, (_, i) => -length / 2 + (i + 0.5) * step) };
}

export const assetsFor = (models: Iterable<unknown>): string[] => {
  const files = new Set<string>();
  for (const model of models) {
    if (typeof model !== 'string') continue;
    if (Object.hasOwn(PROP_ASSETS, model))
      for (const file of (PROP_ASSETS as Partial<Record<PropModel, readonly string[]>>)[model as PropModel] ?? []) files.add(file);
    if (Object.hasOwn(FURNITURE, model)) for (const part of FURNITURE[model as keyof typeof FURNITURE].parts) files.add(part.file);
  }
  return [...files].sort();
};

export function projectUVs(position: ArrayLike<number>, normal: ArrayLike<number>, density: number): Float32Array {
  const count = Math.floor(position.length / 3);
  const uv = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const [x, y, z] = [position[i * 3] ?? 0, position[i * 3 + 1] ?? 0, position[i * 3 + 2] ?? 0];
    const [nx, ny, nz] = [Math.abs(normal[i * 3] ?? 0), Math.abs(normal[i * 3 + 1] ?? 0), Math.abs(normal[i * 3 + 2] ?? 0)];
    const [u, v] = ny >= nx && ny >= nz ? [x, z] : nx >= nz ? [z, y] : [x, y];
    uv[i * 2] = u * density;
    uv[i * 2 + 1] = v * density;
  }
  return uv;
}
