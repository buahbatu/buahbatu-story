import { assertContentValid } from '../content';
import { logger } from '../core/logger';
import type { Engine, GameScene } from '../engine/engine';
import { uiStore } from '../ui/uiState';
import { SCENE } from './keys';

export class BootScene implements GameScene {
  readonly key = SCENE.boot;
  enter(engine: Engine): void {
    try {
      assertContentValid();
    } catch (error) {
      logger.error(error);
      uiStore.set({ fatal: 'boot.contentError' });
      return;
    }
    void engine.start(SCENE.preload);
  }
}
