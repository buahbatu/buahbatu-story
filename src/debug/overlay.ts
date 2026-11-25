import { BufferGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments } from 'three';
import { PLAYER } from '../config/balance';
import { DEBUG } from '../config/world';
import { elevation, rampsOf, standHeight, type AreaData } from '../world/map/logic';
import { boxSegments, cliffSegments, deepTiles, gridSegments, type Segment } from './logic';

export interface DebugLayers {
  collision: boolean;
  grid: boolean;
}

function lines(segs: readonly Segment[], color: string, opacity = 1): LineSegments {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(segs.flat(), 3));
  const material = new LineBasicMaterial({ color, transparent: opacity < 1, opacity, fog: false });
  const mesh = new LineSegments(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  return mesh;
}

export class DebugOverlay {
  readonly root = new Group();
  private grid: LineSegments | null = null;
  private collision = new Group();
  private body: LineSegments | null = null;
  private counts = { grid: 0, boxes: 0, cliffs: 0, deep: 0 };

  constructor() {
    this.root.name = 'debug';
    this.collision.name = 'debug:collision';
    this.root.add(this.collision);
  }

  build(area: AreaData): void {
    this.clear();
    const lift = DEBUG.lift;
    const grid = gridSegments(area, lift);
    this.grid = lines(grid, DEBUG.colors.grid, DEBUG.gridOpacity);
    this.grid.name = 'debug:grid';
    this.root.add(this.grid);
    const boxes = area.collisions.flatMap((r) => {
      const base = elevation(area, r.x + r.w / 2, r.y + r.h / 2) + lift;
      return boxSegments(r.x, r.y, r.w, r.h, base, base + DEBUG.boxHeight);
    });
    const ramps = rampsOf(area).flatMap((r) => boxSegments(r.x, r.y, r.w, r.h, r.base + lift, r.base + r.rise + lift));
    const cliffs = cliffSegments(area, PLAYER.maxStep, lift);
    const deep = deepTiles(area, PLAYER).flatMap(({ x, y }) => boxSegments(x + 0.1, y + 0.1, 0.8, 0.8, lift, lift));
    this.collision.add(
      lines(boxes, DEBUG.colors.collision),
      lines(ramps, DEBUG.colors.body, 0.6),
      lines(cliffs, DEBUG.colors.cliff),
      lines(deep, DEBUG.colors.deep),
    );
    const r = PLAYER.radius;
    this.body = lines(boxSegments(-r, -r, r * 2, r * 2, 0, 0.1), DEBUG.colors.body);
    this.collision.add(this.body);
    this.counts = { grid: grid.length, boxes: area.collisions.length, cliffs: cliffs.length, deep: deep.length / 12 };
  }

  update(area: AreaData, player: { x: number; y: number }, layers: DebugLayers): void {
    if (this.grid) this.grid.visible = layers.grid;
    this.collision.visible = layers.collision;
    this.body?.position.set(player.x, standHeight(area, player.x, player.y) + DEBUG.lift, player.y);
  }

  state(): { grid: number; boxes: number; cliffs: number; deep: number; gridVisible: boolean; collisionVisible: boolean } {
    return { ...this.counts, gridVisible: this.grid?.visible ?? false, collisionVisible: this.collision.visible };
  }

  clear(): void {
    const all = [this.grid, ...this.collision.children].filter((n): n is LineSegments => n instanceof LineSegments);
    for (const l of all) {
      l.geometry.dispose();
      (l.material as LineBasicMaterial).dispose();
      l.removeFromParent();
    }
    this.grid = null;
    this.body = null;
  }
}
