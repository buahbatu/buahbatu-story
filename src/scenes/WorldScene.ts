import {
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector3,
  type Group,
  type Object3D,
  type Texture,
  Mesh,
  MeshLambertMaterial,
} from 'three';
import { PLAYER } from '../config/balance';
import { DEBUG, DEFAULT_AREA, INTERACTION, TRAVEL, INTERIOR, WATER, WATER_FX, WORLD_CAMERA, WORLD_FOG } from '../config/world';
import { OcclusionFader } from '../world/occlusion';
import { WaterFx } from '../world/waterFx';
import { WaterfallView } from '../world/water/mesh';
import { waterSurface } from '../world/water/logic';
import { doorById, edgeAt, enteredEdge, neighbours, placeKey } from '../world/travel/logic';
import type { I18nKey } from '../content/i18n';
import { dialogFor, keyLabel, nearestInteractable, type Interactable } from '../world/interact/logic';
import { DialogController } from '../systems/dialog/controller';
import { bookOf } from '../systems/dialog/logic';
import { dialogFiles } from '../systems/dialog/content';
import { t } from '../content/i18n';
import { NEUTRAL, cameraOffset, rotateVec, stepCamera, type CameraInput, type CameraRig } from '../world/camera/logic';
import { DRY, drip, seeded, splashBurst, stepWet, type WetState } from '../entities/player/wet';
import { logger } from '../core/logger';
import { assetUrl, versioned } from '../core/assetUrl';
import type { Engine, GameScene } from '../engine/engine';
import { APPEARANCE, PlayerView, jumpHeight, stepJump, stepMotion, type Appearance, type Direction, type PlayerMotion } from '../entities';
import { uiStore } from '../ui/uiState';
import { buildArea, disposeTree, preloadArea } from '../world/build';
import { Environment, type Grade } from '../world/environment';
import { bodyBlocked, bridgeAt, parseArea, standHeight, tileIndex, walkLevel, waterAt, type AreaData } from '../world/map/logic';
import { nearest, stepClock, waterBoxes, type Box, type StepClock } from '../systems/audio/logic';
import type { SoundCues } from '../systems/audio/runtime';
import { SCENE } from './keys';
import { DebugOverlay } from '../debug/overlay';
import { EXIT_MARK } from '../world/props/furniture';
import { FpsMeter } from '../debug/logic';
import { filterTexture } from '../render/look';
import { worldCurve } from '../render/curve';

const OCCLUSION_POINTS = [0.8, 1.5] as const;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
export interface InteractionEvent {
  id: number;
  kind: Interactable['kind'];
  action: string;
  area: string;
}
const SILENT: SoundCues = { step: () => undefined, water: () => undefined, silence: () => undefined };
const STILL: CameraInput = { rotate: 0, zoom: 0, pan: { x: 0, y: 0 }, twist: 0 };

const mapUrl = (id: string) => new URL(assetUrl(`maps/${id}.tmj`), location.href);

async function loadAtlas(url: URL): Promise<Texture> {
  const texture = await new TextureLoader().loadAsync(url.href);
  filterTexture(texture, false);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export class WorldScene implements GameScene {
  readonly key = SCENE.world;
  readonly world: { scene: Scene; camera: PerspectiveCamera; grade: Grade };
  readonly environment: Environment;
  area: AreaData | null = null;
  private target: { area: string; spawn?: string } = { area: DEFAULT_AREA };
  private root: Group | null = null;
  private readonly maps = new Map<string, Promise<AreaData>>();
  private readonly atlases = new Map<string, Promise<Texture>>();
  private readonly preloaded = new Set<string>();
  private exitMarks: { node: Object3D; x: number; z: number }[] = [];
  private engine: Engine | null = null;
  private water: Texture | null = null;
  private readonly playerView = new PlayerView();
  readonly occlusion = new OcclusionFader();
  private readonly fx = new WaterFx();
  private readonly falls = new WaterfallView();
  private wet: WetState = DRY;
  private fxTick = 0;
  private rippleIn = 0;
  private splashes = 0;
  private trip: Promise<boolean> | null = null;
  private trips = 0;
  private manifest: Promise<Set<string>> | null = null;
  private insideEdge: number | null = null;
  private rig: CameraRig = NEUTRAL;
  private nearby: Interactable | null = null;
  private debug: { overlay: DebugOverlay; meter: FpsMeter; publishIn: number } | null = null;
  readonly dialog = new DialogController(bookOf(dialogFiles()));
  private done: InteractionEvent[] = [];
  private look = APPEARANCE.A;
  private lookReady: Promise<void> | null = null;
  player: PlayerMotion | null = null;
  sound: SoundCues = SILENT;
  private steps: StepClock = { left: 0 };
  private waterZones: { stream: Box[]; falls: Box[] } = { stream: [], falls: [] };

  constructor() {
    const scene = new Scene();
    this.environment = new Environment(scene, WORLD_FOG, true);
    this.world = {
      scene,
      camera: new PerspectiveCamera(WORLD_CAMERA.fov, 16 / 9, WORLD_CAMERA.near, WORLD_CAMERA.far),
      grade: this.environment.grade,
    };
  }

  notify: (key: I18nKey) => void = () => undefined;

  setHour(hour: number): void {
    this.environment.setHour(hour);
  }

  get travelling(): boolean {
    return this.trip !== null;
  }

  travel(area: string, spawn: string): Promise<boolean> {
    this.trip ??= this.runTrip(area, spawn).finally(() => {
      this.trip = null;
    });
    return this.trip;
  }

  private async runTrip(area: string, spawn: string): Promise<boolean> {
    const known = (await this.availableAreas()).has(area);
    uiStore.set({ fade: true, prompt: null, place: known ? placeKey(area) : null });
    const shown = wait(TRAVEL.fadeMs + (known ? TRAVEL.holdMs : 0));
    await wait(TRAVEL.fadeMs);
    let ok = true;
    try {
      if (!known) throw new Error('closed');
      await Promise.all([this.fetchArea(area), shown]);
      if (this.area?.id !== area) await this.load(area);
      this.spawn(spawn);
      this.insideEdge = this.area && this.player ? (edgeAt(this.area, this.player.x, this.player.y)?.objectId ?? null) : null;
      this.trips++;
    } catch {
      this.notify('travel.closed');
      ok = false;
    }
    uiStore.set({ fade: false, place: null });
    return ok;
  }

  private availableAreas(): Promise<Set<string>> {
    this.manifest ??= fetch(new URL(assetUrl('maps/index.json'), location.href))
      .then((r) => r.json() as Promise<{ areas: string[] }>)
      .then((m) => new Set(m.areas));
    return this.manifest;
  }

  travelState(): { travelling: boolean; trips: number; preloaded: string[] } {
    return { travelling: this.travelling, trips: this.trips, preloaded: [...this.preloaded].sort() };
  }

  goto(area: string, spawn?: string): void {
    this.target = { area, spawn };
  }

  async enter(engine: Engine): Promise<void> {
    this.engine = engine;
    try {
      if (this.area?.id !== this.target.area) await this.load(this.target.area);
      await (this.lookReady ??= this.playerView.setLook(this.look));
      this.spawn(this.target.spawn);
    } catch (error) {
      logger.error(error);
      uiStore.set({ fatal: 'world.loadError' });
    }
  }

  update(dt: number, time: number): void {
    worldCurve.attach(this.world.scene);
    worldCurve.update(dt);
    this.water?.offset.set(time * WATER.flow, time * WATER.flow * 0.6);
    this.falls.update(time);
    for (const m of this.exitMarks) {
      m.node.position.y = Number(m.node.userData.baseY) + Math.sin(time * INTERIOR.exit.speed) * INTERIOR.exit.bob;
      const p = this.player;
      m.node.visible = !p || Math.hypot(p.x - m.x, p.y - m.z) > INTERIOR.exit.hideNear;
    }
    const { area, player, engine } = this;
    if (!area || !player || !engine) return;
    this.updateDebug(dt, area, player, engine);
    const talking = this.dialog.open;
    this.dialog.update(dt, engine.input);
    const raw = talking ? { x: 0, y: 0 } : rotateVec(engine.input.move(), this.rig.yaw);
    const wade = waterAt(area, player.x, player.y, PLAYER.shallowTiles) === 'none' ? 1 : PLAYER.wadeFactor;
    const body = { ...PLAYER, maxStep: PLAYER.maxStep + jumpHeight(player, PLAYER) };
    const moved = stepMotion(player, { x: raw.x * wade, y: raw.y * wade }, engine.input.isDown('run'), dt, area, PLAYER, (x, y, fx, fy) =>
      bodyBlocked(area, x, y, walkLevel(area, fx, fy), body),
    );
    this.player = stepJump(moved, !talking && engine.input.justPressed('jump'), dt, PLAYER);
    this.cueSound(area, player, this.player, dt, engine.input.isDown('run'));
    if (this.travelling) return;
    const crossed = enteredEdge(area, this.player.x, this.player.y, this.insideEdge);
    this.insideEdge = crossed.inside;
    if (crossed.edge) void this.travel(crossed.edge.area, crossed.edge.spawn);
    if (!talking && engine.input.justPressed('interact') && this.nearby?.kind === 'door') {
      const door = doorById(area, this.nearby.id);
      if (door) void this.travel(door.area, door.spawn);
    }
    if (!talking && engine.input.justPressed('interact') && this.nearby) {
      this.done = [...this.done.slice(-19), { id: this.nearby.id, kind: this.nearby.kind, action: this.nearby.action, area: area.id }];
      const id = dialogFor(this.nearby.action);
      if (id && this.dialog.has(id)) this.dialog.start(id, { player: t('player.defaultName') });
    }
    this.splashAndDrip(area, this.player, dt);
    const g = engine.input.gestures();
    const key = Number(engine.input.isDown('zoomOut')) - Number(engine.input.isDown('zoomIn'));
    this.showPlayer(dt, {
      rotate: Number(engine.input.isDown('cameraRight')) - Number(engine.input.isDown('cameraLeft')),
      zoom: g.zoom + key * WORLD_CAMERA.keyZoom * dt,
      pan: { x: g.panX, y: g.panY },
      twist: g.twist,
    });
  }

  enableDebug(): void {
    if (this.debug) return;
    const overlay = new DebugOverlay();
    this.debug = { overlay, meter: new FpsMeter(DEBUG.fpsWindow), publishIn: 0 };
    this.world.scene.add(overlay.root);
    if (this.area) overlay.build(this.area);
  }

  debugState(): ReturnType<DebugOverlay['state']> | null {
    return this.debug?.overlay.state() ?? null;
  }

  private updateDebug(dt: number, area: AreaData, player: PlayerMotion, engine: Engine): void {
    const d = this.debug;
    if (!d) return;
    d.meter.push(dt);
    d.overlay.update(area, player, uiStore.get().debugLayers);
    d.publishIn -= dt;
    if (d.publishIn > 0) return;
    d.publishIn = 1 / DEBUG.panelHz;
    const render = engine.stats;
    uiStore.set({
      debug: {
        ...d.meter.read(),
        calls: render.calls,
        triangles: render.triangles,
        area: area.id,
        x: Math.round(player.x * 100) / 100,
        y: Math.round(player.y * 100) / 100,
        height: Math.round(standHeight(area, player.x, player.y) * 100) / 100,
      },
    });
  }

  setCamera(change: Partial<Pick<CameraRig, 'yaw' | 'zoom'>>): void {
    this.rig = { ...this.rig, ...change };
    this.showPlayer(null);
  }

  cameraState(): CameraRig {
    return { ...this.rig, focus: { ...this.rig.focus }, pan: { ...this.rig.pan } };
  }

  waterState(): { inWater: boolean; wetness: number; particles: number; ripples: number; splashes: number; waterfalls: number } {
    return {
      inWater: this.wet.inWater,
      wetness: this.wet.wetness,
      splashes: this.splashes,
      waterfalls: this.falls.count(),
      ...this.fx.counts(),
    };
  }

  private splashAndDrip(area: AreaData, p: PlayerMotion, dt: number): void {
    const inWater = waterAt(area, p.x, p.y, PLAYER.shallowTiles) !== 'none';
    const step = stepWet(this.wet, inWater, dt, WATER_FX);
    this.wet = step.state;
    const rnd = seeded(p.x * 31.7 + p.y * 17.3 + this.fxTick++);
    if (step.splash) {
      this.splashes++;
      this.fx.add(splashBurst(p.x, waterSurface(area, p.x, p.y), p.y, WATER_FX.splashCount, rnd));
      this.fx.ripple(p.x, waterSurface(area, p.x, p.y) + 0.01, p.y);
    }
    this.rippleIn -= dt;
    if (inWater && p.anim !== 'idle' && this.rippleIn <= 0) {
      this.fx.ripple(p.x, waterSurface(area, p.x, p.y) + 0.01, p.y);
      this.rippleIn = WATER_FX.rippleEvery;
    }
    const ground = standHeight(area, p.x, p.y);
    for (let i = 0; i < step.drips; i++) this.fx.add([drip(p.x, ground, p.y, rnd)]);
    this.fx.update(dt);
    this.playerView.setWet(this.wet.wetness);
  }

  resize(width: number, height: number): void {
    this.world.camera.aspect = width / height;
    this.world.camera.updateProjectionMatrix();
  }

  private fetchArea(id: string): Promise<AreaData> {
    let p = this.maps.get(id);
    if (!p) {
      p = this.readArea(id);
      p.catch(() => this.maps.delete(id));
      this.maps.set(id, p);
    }
    return p;
  }

  private async readArea(id: string): Promise<AreaData> {
    const url = mapUrl(id);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`peta ${id} tidak ditemukan (${String(response.status)})`);
    const { area, issues } = parseArea(id, await response.json());
    if (!area) throw new Error(`peta ${id} tidak valid: ${issues.join('; ')}`);
    await Promise.all([this.atlasFor(versioned(new URL(area.tileset.image, url))), preloadArea(area)]);
    return area;
  }

  private atlasFor(url: URL): Promise<Texture> {
    let p = this.atlases.get(url.href);
    if (!p) {
      p = loadAtlas(url);
      p.catch(() => this.atlases.delete(url.href));
      this.atlases.set(url.href, p);
    }
    return p;
  }

  private async preloadNeighbours(area: AreaData): Promise<void> {
    const open = await this.availableAreas();
    await Promise.all(
      neighbours(area)
        .filter((id) => open.has(id))
        .map((id) =>
          this.fetchArea(id).then(
            () => this.preloaded.add(id),
            (error: unknown) => {
              logger.warn(error);
            },
          ),
        ),
    );
  }

  private cueSound(area: AreaData, before: PlayerMotion, after: PlayerMotion, dt: number, running: boolean): void {
    const speed = dt > 0 ? Math.hypot(after.x - before.x, after.y - before.y) / dt : 0;
    const tick = stepClock(this.steps, dt, after.air ? 0 : speed, running);
    this.steps = tick.clock;
    if (tick.step) {
      const { x, y } = after;
      this.sound.step({
        terrain: area.terrain[tileIndex(area, Math.floor(x), Math.floor(y))],
        bridge: bridgeAt(area, x, y) !== null,
        wading: waterAt(area, x, y, PLAYER.shallowTiles) !== 'none',
      });
    }
    this.sound.water(nearest(after.x, after.y, this.waterZones.stream), nearest(after.x, after.y, this.waterZones.falls));
  }

  exit(): void {
    this.sound.silence();
  }

  private async load(id: string): Promise<void> {
    const area = await this.fetchArea(id);
    this.sound.silence();
    this.waterZones = { stream: waterBoxes(area), falls: area.objects.filter((o) => o.kind === 'waterfall') };
    const atlas = await this.atlasFor(versioned(new URL(area.tileset.image, mapUrl(id))));
    this.occlusion.clear();
    this.fx.clear();
    this.wet = DRY;
    this.playerView.setWet(0);
    if (this.root) disposeTree(this.root);
    this.root = buildArea(area, atlas);
    this.root.updateMatrixWorld(true);
    this.occlusion.setCandidates(this.root.children.filter((n) => n.name.startsWith('prop:')));
    const water = this.root.getObjectByName('water');
    this.water = water instanceof Mesh && water.material instanceof MeshLambertMaterial ? water.material.map : null;
    this.exitMarks = [];
    this.root.traverse((n) => {
      if (n.name !== EXIT_MARK) return;
      const at = n.getWorldPosition(new Vector3());
      this.exitMarks.push({ node: n, x: at.x, z: at.z });
    });
    this.falls.build(area);
    this.world.scene.add(this.root, this.falls.object);
    this.area = area;
    this.debug?.overlay.build(area);
    this.applySettings(area);
    void this.preloadNeighbours(area);
  }

  private applySettings({ settings }: AreaData): void {
    const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
    const indoor = settings.interior === true;
    const text = (v: unknown) => (typeof v === 'string' ? v : undefined);
    const fog = text(settings.fog);
    worldCurve.setFlat(indoor, true);
    this.environment.setAtmosphere({
      sky: text(settings.sky),
      fog,
      near: num(settings.fogNear, indoor ? INTERIOR.fogNear : WORLD_FOG.near),
      far: num(settings.fogFar, indoor ? INTERIOR.fogFar : WORLD_FOG.far),
      indoor: indoor ? { background: text(settings.sky) ?? INTERIOR.background, fog: fog ?? INTERIOR.background } : undefined,
    });
  }

  async setLook(look: Appearance): Promise<void> {
    this.look = look;
    this.lookReady = this.playerView.setLook(look);
    await this.lookReady;
    this.showPlayer(null);
  }

  resetPose(): void {
    if (!this.player) return;
    this.player = { ...this.player, animTime: 0 };
    this.showPlayer(null);
  }

  place(x: number, y: number, facing: Direction): void {
    if (!this.player) return;
    this.player = { ...this.player, x, y, facing, anim: 'idle', animTime: 0 };
    this.showPlayer(null);
  }

  private spawn(spawnId?: string): void {
    if (!this.area) return;
    const spawns = this.area.spawns;
    const at = (spawnId ? spawns[spawnId] : undefined) ?? spawns.start ?? Object.values(spawns)[0] ?? { x: 0, y: 0 };
    this.player = { x: at.x, y: at.y, facing: 's', anim: 'idle', animTime: 0 };
    this.world.scene.add(this.playerView.object, this.fx.object);
    this.showPlayer(null);
  }

  private showPlayer(dt: number | null, input: CameraInput = STILL): void {
    if (!this.area || !this.player) return;
    this.playerView.apply(this.player, standHeight(this.area, this.player.x, this.player.y), dt, jumpHeight(this.player, PLAYER));
    this.placeCamera(this.player, dt, input);
    const h = standHeight(this.area, this.player.x, this.player.y);
    this.occlusion.update(
      this.world.camera,
      OCCLUSION_POINTS.map((dy) => new Vector3(this.player?.x ?? 0, h + dy, this.player?.y ?? 0)),
      dt,
    );
    this.updatePrompt(this.area, this.player);
  }

  interactions(): readonly InteractionEvent[] {
    return this.done;
  }

  private updatePrompt(area: AreaData, player: PlayerMotion): void {
    this.nearby = this.dialog.open ? null : nearestInteractable(area, player, INTERACTION);
    const current = uiStore.get().prompt;
    if (!this.nearby) {
      if (current) uiStore.set({ prompt: null });
      return;
    }
    const spot = new Vector3(
      this.nearby.x,
      standHeight(area, this.nearby.x, this.nearby.y) + INTERACTION.promptHeight,
      this.nearby.y,
    ).project(this.world.camera);
    const head = new Vector3(player.x, standHeight(area, player.x, player.y) + INTERACTION.headHeight, player.y).project(this.world.camera);
    const at = spot.y > head.y ? spot : head;
    const next = {
      key: keyLabel(this.engine?.input.keysFor('interact')[0]),
      text: this.nearby.prompt,
      x: Math.round(((at.x + 1) / 2) * 1000) / 1000,
      y: Math.round(((1 - at.y) / 2) * 1000) / 1000,
    };
    if (current?.key !== next.key || current.text !== next.text || current.x !== next.x || current.y !== next.y)
      uiStore.set({ prompt: next });
  }

  private placeCamera(player: PlayerMotion, dt: number | null, input: CameraInput): void {
    if (!this.area) return;
    const { settings, width, height } = this.area;
    const indoor = settings.interior === true;
    const target = indoor ? { x: width / 2, y: height / 2 - INTERIOR.lookBack } : { x: player.x, y: player.y };
    const distance =
      typeof settings.cameraDistance === 'number' ? settings.cameraDistance : indoor ? INTERIOR.cameraDistance : WORLD_CAMERA.distance;
    const pitch = (WORLD_CAMERA.pitchDeg * Math.PI) / 180;
    const rules = indoor ? { ...WORLD_CAMERA, minZoom: INTERIOR.minZoom, maxZoom: INTERIOR.maxZoom } : WORLD_CAMERA;
    const ctx = { target, moving: player.anim !== 'idle', bounds: { width, height }, locked: indoor, distance };
    this.rig = stepCamera(this.rig, input, ctx, dt, rules);
    const { focus } = this.rig;
    const y = standHeight(this.area, focus.x, focus.y);
    const o = cameraOffset(this.rig, distance, pitch);
    const { camera } = this.world;
    camera.position.set(focus.x + o.x, y + o.y, focus.y + o.z);
    camera.lookAt(focus.x, y, focus.y);
    this.environment.aim(focus.x, y, focus.y);
    worldCurve.focus(focus.x, focus.y, -o.x, -o.z);
  }
}
