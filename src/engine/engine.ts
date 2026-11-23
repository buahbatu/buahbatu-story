import { WebGLRenderer, type Camera, type Scene } from 'three';
import type { InputState } from '../input/logic';
import type { SceneKey } from '../scenes/keys';
import { setActiveScene } from '../ui/uiState';
import type { ViewResult } from '../utils/scale';

export interface GameScene {
  readonly key: SceneKey;
  readonly world?: { scene: Scene; camera: Camera };
  enter(engine: Engine): void | Promise<void>;
  update?(dt: number, time: number): void;
  resize?(width: number, height: number): void;
  exit?(): void;
}

export class Engine {
  readonly renderer: WebGLRenderer;
  readonly input: InputState;
  view: ViewResult;
  private readonly scenes = new Map<SceneKey, GameScene>();
  private current: GameScene | null = null;
  private running = true;
  private time = 0;
  private last = 0;

  constructor(parent: HTMLElement, scenes: GameScene[], view: ViewResult, input: InputState) {
    this.input = input;
    this.renderer = new WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(1);
    this.renderer.domElement.style.imageRendering = 'pixelated';
    this.renderer.domElement.style.display = 'block';
    parent.append(this.renderer.domElement);
    for (const scene of scenes) this.scenes.set(scene.key, scene);
    this.view = view;
    this.resize(view);
    this.renderer.setAnimationLoop(this.tick);
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

  resize(view: ViewResult): void {
    this.view = view;
    this.renderer.setSize(view.width, view.height, false);
    this.renderer.domElement.style.width = `${view.width * view.zoom}px`;
    this.renderer.domElement.style.height = `${view.height * view.zoom}px`;
    this.current?.resize?.(view.width, view.height);
    this.render();
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
    this.render();
  }

  private render(): void {
    const world = this.current?.world;
    if (world) this.renderer.render(world.scene, world.camera);
    else this.renderer.clear();
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const dt = this.last === 0 ? 0 : Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.current?.update?.(dt, this.time);
    this.input.endFrame();
    this.render();
  };
}
