import type { GameScene } from '../engine/engine';
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { TitleScene } from './TitleScene';
import { WorldScene } from './WorldScene';

export { SCENE, type SceneKey } from './keys';
export type { WorldScene } from './WorldScene';

export function createScenes(): { scenes: GameScene[]; world: WorldScene } {
  const world = new WorldScene();
  return { scenes: [new BootScene(), new PreloadScene(world), new TitleScene(world), world], world };
}
