import { Color, PCFShadowMap, WebGLRenderer, type Camera, type Scene } from 'three';
import type { InputState } from '../input/logic';
import { logger } from '../core/logger';
import type * as PostModule from '../render/post';
import type { PostPipeline, RenderStats } from '../render/post';
import { profile } from '../render/look';
import type { Grade } from '../world/environment';
import type { SceneKey } from '../scenes/keys';
import { setActiveScene } from '../ui/uiState';
import type { ViewResult } from '../utils/scale';

export interface GameScene {
  readonly key: SceneKey;
  readonly world?: { scene: Scene; camera: Camera; grade?: Grade };
  enter(engine: Engine): void | Promise<void>;
  update?(dt: number, time: number): void;
  resize?(width: number, height: number): void;
  exit?(): void;
}

const NEUTRAL_GRADE: Grade = {
  exposure: 1,
  saturation: 1,
  contrast: 1,
  tint: new Color(1, 1, 1),
  lift: new Color(0, 0, 0),
  vignette: 0,
  bloom: 0,
  tilt: 0,
};

export class Engine {
  readonly renderer: WebGLRenderer;
  readonly input: InputState;
  view: ViewResult;
  private readonly scenes = new Map<SceneKey, GameScene>();
  private current: GameScene | null = null;
  private running = true;
  private time = 0;
  private last = 0;
  private fxOn = false;
  private post: Promise<typeof PostModule> | null = null;
  private postModule: typeof PostModule | null = null;
  private readonly pipelines = new Map<Scene, PostPipeline>();

  constructor(parent: HTMLElement, scenes: GameScene[], view: ViewResult, input: InputState) {
    this.input = input;
    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(view.ratio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.domElement.style.display = 'block';
    parent.append(this.renderer.domElement);
    for (const scene of scenes) this.scenes.set(scene.key, scene);
    this.view = view;
    this.resize(view);
    this.renderer.setAnimationLoop(this.tick);
  }

  get elapsed(): number {
    return this.time;
  }

  get scene(): SceneKey | null {
    return this.current?.key ?? null;
  }

  async start(key: SceneKey): Promise<void> {
    const next = this.scenes.get(key);
    if (!next) throw new Error(`Scene tidak dikenal: ${key}`);
    this.current?.exit?.();
    this.current = next;
    next.resize?.(this.view.width, this.view.height);
    await next.enter(this);
    if (this.current === next) setActiveScene(key);
  }

  get fx(): boolean {
    return this.fxOn;
  }

  set fx(on: boolean) {
    if (on === this.fxOn) return;
    this.fxOn = on;
    if (on) this.loadPost();
    else this.disposePipelines();
  }

  get stats(): RenderStats {
    const world = this.current?.world;
    const pipeline = world && this.fxOn ? this.pipelines.get(world.scene) : undefined;
    return pipeline ? pipeline.stats : { calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles };
  }

  passes(): string[] {
    const world = this.current?.world;
    const pipeline = world && this.fxOn ? this.pipelines.get(world.scene) : undefined;
    return pipeline ? [...pipeline.passes] : [];
  }

  whenFxReady(): Promise<void> {
    return this.post ? this.post.then(() => undefined) : Promise.resolve();
  }

  resize(view: ViewResult): void {
    this.view = view;
    this.renderer.setPixelRatio(view.ratio);
    this.renderer.setSize(view.width, view.height, false);
    this.renderer.domElement.style.width = `${view.width * view.zoom}px`;
    this.renderer.domElement.style.height = `${view.height * view.zoom}px`;
    this.current?.resize?.(view.width, view.height);
    for (const pipeline of this.pipelines.values()) pipeline.setSize(view.width, view.height);
    this.render(0);
  }

  sleep(): void {
    this.running = false;
  }

  wake(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
  }

  freezeAt(time: number): void {
    this.running = false;
    this.time = time;
    this.current?.update?.(0, time);
    this.render(0);
  }

  private loadPost(): void {
    this.post ??= import('../render/post').then(
      (m) => {
        this.postModule = m;
        return m;
      },
      (error: unknown) => {
        logger.error('Efek grafis gagal dimuat', error);
        this.fxOn = false;
        throw error;
      },
    );
    this.post.catch(() => undefined);
  }

  private disposePipelines(): void {
    for (const pipeline of this.pipelines.values()) pipeline.dispose();
    this.pipelines.clear();
  }

  private pipelineFor(world: { scene: Scene; camera: Camera }): PostPipeline | null {
    if (!this.fxOn || !this.postModule) return null;
    let pipeline = this.pipelines.get(world.scene);
    if (!pipeline) {
      pipeline = new this.postModule.PostPipeline(this.renderer, world.scene, world.camera, profile().fx);
      this.pipelines.set(world.scene, pipeline);
    }
    return pipeline;
  }

  private render(dt: number): void {
    const world = this.current?.world;
    if (!world) {
      this.renderer.clear();
      return;
    }
    const pipeline = this.pipelineFor(world);
    if (pipeline) pipeline.render(dt, world.grade ?? NEUTRAL_GRADE);
    else this.renderer.render(world.scene, world.camera);
  }

  onFrame: (dt: number) => void = () => undefined;

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const dt = this.last === 0 ? 0 : Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.onFrame(dt);
    this.current?.update?.(dt, this.time);
    this.input.endFrame();
    this.render(dt);
  };
}
