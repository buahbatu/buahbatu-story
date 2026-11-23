import { Color, Fog, NearestFilter, PerspectiveCamera, SRGBColorSpace, Scene, TextureLoader, type Group, type Texture } from 'three';
import { PALETTE } from '../config/palette';
import { DEFAULT_AREA, INTERIOR, WORLD_CAMERA, WORLD_FOG } from '../config/world';
import { logger } from '../core/logger';
import type { GameScene } from '../engine/engine';
import { uiStore } from '../ui/uiState';
import { buildArea, disposeTree } from '../world/build';
import { addEnvironment } from '../world/environment';
import { elevation, parseArea, type AreaData } from '../world/map/logic';
import { SCENE } from './keys';

const mapUrl = (id: string) => new URL(`${import.meta.env.BASE_URL}assets/maps/${id}.tmj`, location.href);

async function loadAtlas(url: URL): Promise<Texture> {
  const texture = await new TextureLoader().loadAsync(url.href);
  texture.magFilter = texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export class WorldScene implements GameScene {
  readonly key = SCENE.world;
  readonly world: { scene: Scene; camera: PerspectiveCamera };
  area: AreaData | null = null;
  private target: { area: string; spawn?: string } = { area: DEFAULT_AREA };
  private root: Group | null = null;
  private atlas: Texture | null = null;

  constructor() {
    const scene = new Scene();
    addEnvironment(scene, WORLD_FOG);
    this.world = { scene, camera: new PerspectiveCamera(WORLD_CAMERA.fov, 16 / 9, WORLD_CAMERA.near, WORLD_CAMERA.far) };
  }

  goto(area: string, spawn?: string): void {
    this.target = { area, spawn };
  }

  async enter(): Promise<void> {
    try {
      if (this.area?.id !== this.target.area) await this.load(this.target.area);
      this.focus(this.target.spawn);
    } catch (error) {
      logger.error(error);
      uiStore.set({ fatal: 'world.loadError' });
    }
  }

  resize(width: number, height: number): void {
    this.world.camera.aspect = width / height;
    this.world.camera.updateProjectionMatrix();
  }

  private async load(id: string): Promise<void> {
    const url = mapUrl(id);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`peta ${id} tidak ditemukan (${String(response.status)})`);
    const { area, issues } = parseArea(id, await response.json());
    if (!area) throw new Error(`peta ${id} tidak valid: ${issues.join('; ')}`);
    const atlas = await loadAtlas(new URL(area.tileset.image, url));
    if (this.root) disposeTree(this.root);
    this.atlas?.dispose();
    this.atlas = atlas;
    this.root = buildArea(area, atlas);
    this.world.scene.add(this.root);
    this.area = area;
    this.applySettings(area);
  }

  private applySettings({ settings }: AreaData): void {
    const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
    const indoor = settings.interior === true;
    const sky = typeof settings.sky === 'string' ? settings.sky : indoor ? INTERIOR.background : PALETTE.sky;
    const fog = typeof settings.fog === 'string' ? settings.fog : indoor ? INTERIOR.background : PALETTE.fog;
    const fogNear = indoor ? INTERIOR.fogNear : WORLD_FOG.near;
    this.world.scene.background = new Color(sky);
    this.world.scene.fog = new Fog(fog, num(settings.fogNear, fogNear), num(settings.fogFar, indoor ? INTERIOR.fogFar : WORLD_FOG.far));
  }

  private focus(spawnId?: string): void {
    if (!this.area) return;
    const spawns = this.area.spawns;
    const spawn = (spawnId ? spawns[spawnId] : undefined) ?? spawns.start ?? Object.values(spawns)[0] ?? { x: 0, y: 0 };
    const { settings, width, height } = this.area;
    const indoor = settings.interior === true;
    const target = indoor ? { x: width / 2, y: height / 2 - INTERIOR.lookBack } : spawn;
    const distance =
      typeof settings.cameraDistance === 'number' ? settings.cameraDistance : indoor ? INTERIOR.cameraDistance : WORLD_CAMERA.distance;
    const pitch = (WORLD_CAMERA.pitchDeg * Math.PI) / 180;
    const y = elevation(this.area, target.x, target.y);
    const { camera } = this.world;
    camera.position.set(target.x, y + Math.sin(pitch) * distance, target.y + Math.cos(pitch) * distance);
    camera.lookAt(target.x, y, target.y);
  }
}
