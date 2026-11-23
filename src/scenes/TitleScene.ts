import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  type BufferGeometry,
} from 'three';
import { PALETTE } from '../config/palette';
import type { GameScene } from '../engine/engine';
import { SCENE } from './keys';

const CAMERA = { fov: 38, distance: 22, height: 7, lookY: 2.5, lookZ: -14, sway: 0.16, speed: 0.12 } as const;
const materials = new Map<number, MeshLambertMaterial>();
function mat(color: number): MeshLambertMaterial {
  const cached = materials.get(color);
  if (cached) return cached;
  const created = new MeshLambertMaterial({ color, flatShading: true });
  materials.set(color, created);
  return created;
}

function block(geometry: BufferGeometry, color: number, x: number, y: number, z: number, rotY = 0): Mesh {
  const mesh = new Mesh(geometry, mat(color));
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  return mesh;
}

function tree(x: number, z: number, scale = 1): Group {
  const g = new Group();
  g.add(block(new CylinderGeometry(0.25 * scale, 0.3 * scale, 1.6 * scale, 6), PALETTE.bark, 0, 0.8 * scale, 0));
  g.add(block(new IcosahedronGeometry(1.2 * scale, 0), PALETTE.leafDark, 0, 2.2 * scale, 0));
  g.add(block(new IcosahedronGeometry(0.9 * scale, 0), PALETTE.leaf, 0.2 * scale, 2.7 * scale, 0.2 * scale));
  g.position.set(x, 0, z);
  return g;
}

function house(x: number, z: number): Group {
  const g = new Group();
  g.add(block(new BoxGeometry(5, 3, 4), PALETTE.wall, 0, 1.5, 0));
  const roof = block(new ConeGeometry(4.2, 2.2, 4), PALETTE.roof, 0, 4.1, 0, Math.PI / 4);
  roof.scale.set(1.25, 1, 1);
  g.add(roof);
  g.add(block(new BoxGeometry(1, 1.8, 0.1), PALETTE.wood, 0.6, 0.9, 2.02));
  g.add(block(new BoxGeometry(1, 0.8, 0.1), PALETTE.sky, -1.4, 1.8, 2.02));
  g.position.set(x, 0, z);
  g.rotation.y = 0.35;
  return g;
}

function farm(x: number, z: number): Group {
  const g = new Group();
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++) {
      const px = col * 1.1;
      const pz = row * 1.1;
      g.add(block(new BoxGeometry(1, 0.2, 1), PALETTE.soil, px, 0.1, pz));
      g.add(block(new BoxGeometry(0.3, 0.3, 0.3), PALETTE.strawberry, px, 0.35, pz));
      g.add(block(new ConeGeometry(0.25, 0.25, 4), PALETTE.leaf, px, 0.58, pz));
    }
  for (let i = 0; i <= 6; i++) g.add(block(new BoxGeometry(0.15, 0.8, 0.15), PALETTE.wood, i * 1.1 - 0.55, 0.4, -0.75));
  g.add(block(new BoxGeometry(6.8, 0.12, 0.1), PALETTE.wood, 2.75, 0.6, -0.75));
  g.position.set(x, 0, z);
  return g;
}

function hills(): Mesh[] {
  const spots: [number, number, number][] = [
    [-35, -60, 18],
    [0, -70, 24],
    [38, -62, 20],
    [-60, -45, 16],
    [62, -48, 18],
  ];
  return spots.map(([x, z, r]) => {
    const hill = block(new IcosahedronGeometry(r, 1), PALETTE.leafDark, x, -r * 0.55, z);
    hill.scale.y = 0.6;
    return hill;
  });
}

export class TitleScene implements GameScene {
  readonly key = SCENE.title;
  readonly world: { scene: Scene; camera: PerspectiveCamera };
  private readonly still = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    const scene = new Scene();
    scene.background = new Color(PALETTE.sky);
    scene.fog = new Fog(PALETTE.fog, 35, 95);
    scene.add(new HemisphereLight(PALETTE.sun, PALETTE.grassDark, 1.6));
    const sun = new DirectionalLight(PALETTE.sun, 1.4);
    sun.position.set(10, 20, 8);
    scene.add(sun);
    const ground = block(new PlaneGeometry(120, 120), PALETTE.grass, 0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    const path = block(new PlaneGeometry(2.2, 40), PALETTE.path, -2, 0.01, 0);
    path.rotation.x = -Math.PI / 2;
    const trees: [number, number, number][] = [
      [-11, -9, 1.2],
      [10, -8, 1],
      [12, 2, 0.9],
      [-12, 4, 1],
      [4, -13, 1.1],
      [14, -12, 1.3],
      [-16, -2, 1.1],
      [17, -4, 1.2],
      [-6, -16, 1.3],
      [8, -18, 1.4],
      [-18, -14, 1.5],
      [20, -16, 1.4],
      [-3, -22, 1.6],
      [13, -24, 1.7],
      [-14, -24, 1.7],
    ];
    scene.add(path, house(-7, -3), farm(1, -2), ...trees.map(([x, z, k]) => tree(x, z, k)), ...hills());
    this.world = { scene, camera: new PerspectiveCamera(CAMERA.fov, 16 / 9, 0.1, 200) };
    this.update(0, 0);
  }

  enter(): void {
    this.update(0, 0);
  }

  resize(width: number, height: number): void {
    this.world.camera.aspect = width / height;
    this.world.camera.updateProjectionMatrix();
  }

  update(_dt: number, time: number): void {
    const angle = this.still.matches ? 0 : Math.sin(time * CAMERA.speed) * CAMERA.sway;
    const { camera } = this.world;
    camera.position.set(Math.sin(angle) * CAMERA.distance, CAMERA.height, Math.cos(angle) * CAMERA.distance);
    camera.lookAt(0, CAMERA.lookY, CAMERA.lookZ);
  }
}
