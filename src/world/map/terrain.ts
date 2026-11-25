import { ATLAS_INSET, HEIGHT_STEP, TERRAIN_LOOK, WATER } from '../../config/world';
import { cornerHill, elevation, tileIndex, tileLevel, type AreaData } from './logic';
import { exitRect, riverExits } from '../water/logic';

export interface TerrainMesh {
  positions: number[];
  normals: number[];
  uvs: number[];
  colors: number[];
  indices: number[];
  quads: { top: number; side: number };
}

type Vec3 = [number, number, number];
type Area = Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain' | 'tileset' | 'objects'>;

const SIDES = [
  { dx: 0, dy: 1, left: [0, 1], right: [1, 1] },
  { dx: 0, dy: -1, left: [1, 0], right: [0, 0] },
  { dx: 1, dy: 0, left: [1, 1], right: [1, 0] },
  { dx: -1, dy: 0, left: [0, 0], right: [0, 1] },
] as const;

export function tileHash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function atlasRect(tileset: Area['tileset'], tile: number, fraction = 1): [number, number, number, number] {
  const col = tile % tileset.columns;
  const row = Math.floor(tile / tileset.columns);
  const u0 = (col + ATLAS_INSET) / tileset.columns;
  const u1 = (col + 1 - ATLAS_INSET) / tileset.columns;
  const vTop = 1 - (row + ATLAS_INSET) / tileset.rows;
  const vBottom = 1 - (row + ATLAS_INSET + (1 - 2 * ATLAS_INSET) * fraction) / tileset.rows;
  return [u0, u1, vTop, vBottom];
}

const NO_LIFT: readonly number[] = [0, 0, 0, 0];

export function buildTerrain(area: Area): TerrainMesh {
  const mesh: TerrainMesh = { positions: [], normals: [], uvs: [], colors: [], indices: [], quads: { top: 0, side: 0 } };
  const organic = new Set<string>(TERRAIN_LOOK.organic);
  const tileOf = (terrain: string) => area.tileset.terrainTiles[terrain] ?? 0;
  const normal = (a: Vec3, b: Vec3, c: Vec3): Vec3 => {
    const [ux, uy, uz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const [vx, vy, vz] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n: Vec3 = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const len = Math.hypot(...n) || 1;
    return [n[0] / len, n[1] / len, n[2] / len];
  };
  const quad = (
    corners: [Vec3, Vec3, Vec3, Vec3],
    [u0, u1, vTop, vBottom]: [number, number, number, number],
    shade = 1,
    turns = 0,
    lift: readonly number[] = NO_LIFT,
  ) => {
    const [a, b, c, d] = corners;
    const uv = [u0, vTop, u0, vBottom, u1, vBottom, u1, vTop];
    const k = (turns % 4) * 2;
    const uvs = [...uv.slice(k), ...uv.slice(0, k)];
    const n1 = normal(a, b, c);
    const n2 = normal(a, c, d);
    const planar = Math.abs(n1[0] - n2[0]) + Math.abs(n1[1] - n2[1]) + Math.abs(n1[2] - n2[2]) < 1e-6;
    const base = mesh.positions.length / 3;
    const order = planar ? [0, 1, 2, 3] : [0, 1, 2, 0, 2, 3];
    order.forEach((i, j) => {
      const n = planar || j < 3 ? n1 : n2;
      const tone =
        shade *
        (1 + TERRAIN_LOOK.hillTint * (lift[i] ?? 0)) *
        (1 - TERRAIN_LOOK.slopeShade * (1 - Math.abs(n[1])) * (lift === NO_LIFT ? 0 : 1));
      mesh.positions.push(...(corners[i] ?? a));
      mesh.normals.push(...n);
      mesh.uvs.push(uvs[i * 2] ?? 0, uvs[i * 2 + 1] ?? 0);
      mesh.colors.push(tone, tone, tone);
    });
    if (planar) mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else mesh.indices.push(base, base + 1, base + 2, base + 3, base + 4, base + 5);
  };
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      const terrain = area.terrain[tileIndex(area, x, y)] ?? 'grass';
      const top = tileLevel(area, x, y);
      const lift = (cx: number, cy: number) => cornerHill(area, cx, cy);
      const hills = [lift(x, y), lift(x, y + 1), lift(x + 1, y + 1), lift(x + 1, y)];
      quad(
        [
          [x, top + (hills[0] ?? 0), y],
          [x, top + (hills[1] ?? 0), y + 1],
          [x + 1, top + (hills[2] ?? 0), y + 1],
          [x + 1, top + (hills[3] ?? 0), y],
        ],
        atlasRect(area.tileset, tileOf(terrain)),
        1 + (tileHash(x, y, 1) - 0.5) * 2 * TERRAIN_LOOK.jitter,
        organic.has(terrain) ? Math.floor(tileHash(x, y, 2) * 4) : 0,
        hills.some((h) => h !== 0) ? hills : NO_LIFT,
      );
      mesh.quads.top++;
      for (const side of SIDES) {
        const nx = x + side.dx;
        const ny = y + side.dy;
        if (nx < 0 || ny < 0 || nx >= area.width || ny >= area.height) continue;
        const low = tileLevel(area, nx, ny);
        if (low >= top) continue;
        const tile = tileOf(top - low >= HEIGHT_STEP ? 'cliff' : terrain);
        const [lx, lz] = [x + side.left[0], y + side.left[1]];
        const [rx, rz] = [x + side.right[0], y + side.right[1]];
        const [hl, hr] = [lift(lx, lz), lift(rx, rz)];
        for (let hi = top; hi > low + 1e-6; hi -= 1) {
          const lo = Math.max(low, hi - 1);
          quad(
            [
              [lx, hi + hl, lz],
              [lx, lo + hl, lz],
              [rx, lo + hr, rz],
              [rx, hi + hr, rz],
            ],
            atlasRect(area.tileset, tile, hi - lo),
            TERRAIN_LOOK.sideShade,
          );
          mesh.quads.side++;
        }
      }
    }
  return mesh;
}

export interface WaterMesh {
  positions: number[];
  uvs: number[];
  indices: number[];
}

export function buildWater(area: Pick<AreaData, 'width' | 'height' | 'terrain' | 'heights'>, margin = 0): WaterMesh {
  const mesh: WaterMesh = { positions: [], uvs: [], indices: [] };
  const quad = (x0: number, z0: number, x1: number, z1: number, y: number) => {
    const base = mesh.positions.length / 3;
    for (const [cx, cz] of [
      [x0, z0],
      [x0, z1],
      [x1, z1],
      [x1, z0],
    ] as const) {
      mesh.positions.push(cx, y, cz);
      mesh.uvs.push(cx, -cz);
    }
    mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  if (margin > 0)
    for (const e of riverExits(area)) {
      const r = exitRect(e, area, margin);
      quad(r.x, r.z, r.x + r.w, r.z + r.d, WATER.surface);
    }
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      if (area.terrain[tileIndex(area, x, y)] !== 'water') continue;
      const surface = (area.heights[tileIndex(area, x, y)] ?? 0) * HEIGHT_STEP + WATER.surface;
      const base = mesh.positions.length / 3;
      for (const [cx, cy] of [
        [x, y],
        [x, y + 1],
        [x + 1, y + 1],
        [x + 1, y],
      ] as const) {
        mesh.positions.push(cx, surface, cy);
        mesh.uvs.push(cx, -cy);
      }
      mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  return mesh;
}

export interface Tuft {
  x: number;
  y: number;
  z: number;
  turn: number;
  scale: number;
}

export function scatterTufts(
  area: Pick<AreaData, 'width' | 'height' | 'terrain' | 'heights' | 'objects'>,
  blocked: (x: number, y: number) => boolean,
  density: number = TERRAIN_LOOK.tuftDensity,
): Tuft[] {
  const tufts: Tuft[] = [];
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      const terrain = area.terrain[tileIndex(area, x, y)];
      if (terrain !== 'grass' && terrain !== 'grass_flowers') continue;
      const count = Math.floor(tileHash(x, y, 3) * density * 3);
      for (let i = 0; i < count; i++) {
        const tx = x + 0.15 + tileHash(x, y, 10 + i) * 0.7;
        const ty = y + 0.15 + tileHash(x, y, 20 + i) * 0.7;
        if (blocked(tx, ty)) continue;
        tufts.push({
          x: tx,
          y: elevation(area, tx, ty),
          z: ty,
          turn: tileHash(x, y, 30 + i) * Math.PI,
          scale: 0.7 + tileHash(x, y, 40 + i) * 0.6,
        });
      }
    }
  return tufts;
}
