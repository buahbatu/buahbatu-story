import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  type Object3D,
} from 'three';
import { PALETTE } from '../config/palette';
import type { GameScene } from '../engine/engine';
import { farmhouse, fence, strawberryPlot, tree } from '../world/props/models';
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

function placed<T extends Object3D>(object: T, x: number, z: number, rotY = 0): T {
  object.position.set(x, 0, z);
  object.rotation.y = rotY;
  return object;
}

function plane(w: number, d: number, color: number, x: number, y: number, z: number): Mesh {
  const mesh = new Mesh(new PlaneGeometry(w, d), mat(color));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  return mesh;
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
    const hill = new Mesh(new IcosahedronGeometry(r, 1), mat(PALETTE.leafDark));
    hill.position.set(x, -r * 0.55, z);
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
    scene.add(plane(160, 160, PALETTE.grass, 0, 0, 0), plane(2.2, 40, PALETTE.path, -1.6, 0.01, 4));
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
    scene.add(
      placed(farmhouse(), -7, -4, 0.62),
      placed(strawberryPlot(6, 4), 4, -1),
      placed(fence(7), 4, -3.9),
      ...trees.map(([x, z, k]) => placed(tree(k), x, z)),
      ...hills(),
    );
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
