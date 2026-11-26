import { IcosahedronGeometry, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, type Object3D } from 'three';
import { PALETTE } from '../config/palette';
import type { Engine, GameScene } from '../engine/engine';
import { APPEARANCE } from '../entities';
import { createCharacter, type Character } from '../entities/player/character';
import { TITLE_START } from '../config/world';
import type { WorldScene } from './WorldScene';
import { Environment, type Grade } from '../world/environment';
import { LIGHTING } from '../config/lighting';
import { worldCurve } from '../render/curve';
import { uiStore } from '../ui/uiState';
import { bendablePlane } from '../render/segments';
import { preloadAssets } from '../world/props/assets';
import { assetsFor } from '../world/props/logic';
import { farmhouse, strawberryPlot } from '../world/props/models';
import { fence, tree } from '../world/props/nature';
import { SCENE } from './keys';

const CAMERA = { fov: 38, distance: 22, height: 7, lookY: 2.5, lookZ: -14, focusZ: 3, sway: 0.16, speed: 0.12 } as const;
const CAST = [
  { look: 'A', x: -3.3, z: 3.2, yaw: 0.4 },
  { look: 'B', x: 0.1, z: 3.4, yaw: -0.4 },
] as const;
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
  const mesh = new Mesh(bendablePlane(w, d), mat(color));
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
  readonly world: { scene: Scene; camera: PerspectiveCamera; grade: Grade };
  private readonly still = window.matchMedia('(prefers-reduced-motion: reduce)');
  private decorated: Promise<void> | null = null;
  private cast: Character[] = [];
  private engine: Engine | null = null;
  private visits = 0;
  private readonly world3d: WorldScene;
  readonly environment: Environment;

  constructor(world: WorldScene) {
    this.world3d = world;
    const scene = new Scene();
    const environment = new Environment(scene, { near: 35, far: 95 }, true);
    environment.setHour(LIGHTING.titleHour);
    environment.aim(0, 0, -4);
    this.environment = environment;
    scene.add(plane(160, 160, PALETTE.grass, 0, 0, 0), plane(2.2, 40, PALETTE.path, -1.6, 0.01, 4));
    this.world = { scene, camera: new PerspectiveCamera(CAMERA.fov, 16 / 9, 0.1, 200), grade: environment.grade };
    scene.add(placed(farmhouse(), -7, -4, 0.62), placed(strawberryPlot(6, 4), 4, -1), ...hills());
    this.update(0, 0);
  }

  private decorate(): void {
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
    this.world.scene.add(placed(fence(7), 4, -3.9), ...trees.map(([x, z, k], i) => placed(tree(k, (i * 0.618) % 1), x, z)));
  }

  async enter(engine: Engine): Promise<void> {
    worldCurve.setFlat(false, true);
    this.update(0, 0);
    const visit = ++this.visits;
    this.decorated ??= Promise.all([preloadAssets(assetsFor(['tree', 'fence'])), this.addCast()]).then(() => {
      this.decorate();
    });
    await this.decorated;
    if (visit !== this.visits) return;
    this.engine = engine;
    window.addEventListener('keydown', this.begin);
    window.addEventListener('pointerdown', this.begin);
  }

  exit(): void {
    this.visits++;
    this.engine = null;
    window.removeEventListener('keydown', this.begin);
    window.removeEventListener('pointerdown', this.begin);
  }

  private readonly begin = (event: KeyboardEvent | PointerEvent): void => {
    const engine = this.engine;
    if (!engine || uiStore.get().settingsOpen || ('repeat' in event && event.repeat) || ('button' in event && event.button > 0)) return;
    this.exit();
    this.world3d.goto(TITLE_START.area, TITLE_START.spawn);
    void engine.start(SCENE.world);
  };

  private async addCast(): Promise<void> {
    this.cast = await Promise.all(
      CAST.map(async ({ look, x, z, yaw }) => {
        const c = await createCharacter(APPEARANCE[look]);
        c.root.position.set(x, 0, z);
        c.root.rotation.y = yaw;
        this.world.scene.add(c.root);
        return c;
      }),
    );
  }

  resize(width: number, height: number): void {
    this.world.camera.aspect = width / height;
    this.world.camera.updateProjectionMatrix();
  }

  update(dt: number, time: number): void {
    this.cast.forEach((c, i) => {
      c.play('idle', time + i * 0.7);
    });
    const angle = this.still.matches ? 0 : Math.sin(time * CAMERA.speed) * CAMERA.sway;
    const { camera } = this.world;
    camera.position.set(Math.sin(angle) * CAMERA.distance, CAMERA.height, Math.cos(angle) * CAMERA.distance);
    camera.lookAt(0, CAMERA.lookY, CAMERA.lookZ);
    worldCurve.attach(this.world.scene);
    worldCurve.focus(0, CAMERA.focusZ, -camera.position.x, CAMERA.lookZ - camera.position.z);
    worldCurve.update(dt);
  }
}
