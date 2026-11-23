import { ATLAS_INSET, HEIGHT_STEP } from '../../config/world';
import { elevation, tileIndex, type AreaData } from './logic';

export interface TerrainMesh {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  quads: { top: number; side: number };
}

type Vec3 = [number, number, number];
type Area = Pick<AreaData, 'width' | 'height' | 'heights' | 'terrain' | 'tileset'>;

const SIDES = [
  { dx: 0, dy: 1, left: [0, 1], right: [1, 1] },
  { dx: 0, dy: -1, left: [1, 0], right: [0, 0] },
  { dx: 1, dy: 0, left: [1, 1], right: [1, 0] },
  { dx: -1, dy: 0, left: [0, 0], right: [0, 1] },
] as const;

export function atlasRect(tileset: Area['tileset'], tile: number, fraction = 1): [number, number, number, number] {
  const col = tile % tileset.columns;
  const row = Math.floor(tile / tileset.columns);
  const u0 = (col + ATLAS_INSET) / tileset.columns;
  const u1 = (col + 1 - ATLAS_INSET) / tileset.columns;
  const vTop = 1 - (row + ATLAS_INSET) / tileset.rows;
  const vBottom = 1 - (row + ATLAS_INSET + (1 - 2 * ATLAS_INSET) * fraction) / tileset.rows;
  return [u0, u1, vTop, vBottom];
}

export function buildTerrain(area: Area): TerrainMesh {
  const mesh: TerrainMesh = { positions: [], normals: [], uvs: [], indices: [], quads: { top: 0, side: 0 } };
  const tileOf = (terrain: string) => area.tileset.terrainTiles[terrain] ?? 0;
  const quad = (corners: [Vec3, Vec3, Vec3, Vec3], [u0, u1, vTop, vBottom]: [number, number, number, number]) => {
    const [a, b, c] = corners;
    const [ux, uy, uz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const [vx, vy, vz] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n: Vec3 = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const len = Math.hypot(...n) || 1;
    const base = mesh.positions.length / 3;
    corners.forEach((p) => {
      mesh.positions.push(...p);
      mesh.normals.push(n[0] / len, n[1] / len, n[2] / len);
    });
    mesh.uvs.push(u0, vTop, u0, vBottom, u1, vBottom, u1, vTop);
    mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  for (let y = 0; y < area.height; y++)
    for (let x = 0; x < area.width; x++) {
      const terrain = area.terrain[tileIndex(area, x, y)] ?? 'grass';
      const top = elevation(area, x, y);
      quad(
        [
          [x, top, y],
          [x, top, y + 1],
          [x + 1, top, y + 1],
          [x + 1, top, y],
        ],
        atlasRect(area.tileset, tileOf(terrain)),
      );
      mesh.quads.top++;
      for (const side of SIDES) {
        const nx = x + side.dx;
        const ny = y + side.dy;
        if (nx < 0 || ny < 0 || nx >= area.width || ny >= area.height) continue;
        const low = elevation(area, nx, ny);
        if (low >= top) continue;
        const tile = tileOf(top - low >= HEIGHT_STEP ? 'cliff' : terrain);
        const [lx, lz] = [x + side.left[0], y + side.left[1]];
        const [rx, rz] = [x + side.right[0], y + side.right[1]];
        for (let hi = top; hi > low + 1e-6; hi -= 1) {
          const lo = Math.max(low, hi - 1);
          quad(
            [
              [lx, hi, lz],
              [lx, lo, lz],
              [rx, lo, rz],
              [rx, hi, rz],
            ],
            atlasRect(area.tileset, tile, hi - lo),
          );
          mesh.quads.side++;
        }
      }
    }
  return mesh;
}
