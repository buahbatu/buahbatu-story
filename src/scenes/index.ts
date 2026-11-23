import type { GameScene } from '../engine/engine';
import { BootScene } from './BootScene';
import { PreloadScene } from './PreloadScene';
import { TitleScene } from './TitleScene';

export { SCENE, type SceneKey } from './keys';

export const createScenes = (): GameScene[] => [new BootScene(), new PreloadScene(), new TitleScene()];
