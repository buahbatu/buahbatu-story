import type { GameScene } from '../engine/engine';
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { TitleScene } from './TitleScene';
import { WorldScene } from './WorldScene';

export { SCENE, type SceneKey } from './keys';
export type { WorldScene } from './WorldScene';

export function createScenes(): { scenes: GameScene[]; world: WorldScene; title: TitleScene } {
  const world = new WorldScene();
  const title = new TitleScene(world);
  return { scenes: [new BootScene(), new PreloadScene(world), title, world], world, title };
}
