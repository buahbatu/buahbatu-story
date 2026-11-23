import { FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS } from '../config/ui';
import type { Engine, GameScene } from '../engine/engine';
import { uiStore } from '../ui/uiState';
import { waitForFonts } from '../utils/fonts';
import { SCENE } from './keys';

export class PreloadScene implements GameScene {
  readonly key = SCENE.preload;
  async enter(engine: Engine): Promise<void> {
    uiStore.set({ loading: 0 });
    await waitForFonts(document.fonts, FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS);
    uiStore.set({ loading: null });
    void engine.start(SCENE.title);
  }
}
