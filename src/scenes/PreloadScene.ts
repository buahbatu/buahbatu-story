import { FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS } from '../config/ui';
import { AREA_ID_PATTERN } from '../config/world';
import type { Engine, GameScene } from '../engine/engine';
import { uiStore } from '../ui/uiState';
import { waitForFonts } from '../utils/fonts';
import { SCENE } from './keys';
import type { WorldScene } from './WorldScene';

export class PreloadScene implements GameScene {
  readonly key = SCENE.preload;
  private readonly target: WorldScene;
  constructor(world: WorldScene) {
    this.target = world;
  }

  async enter(engine: Engine): Promise<void> {
    uiStore.set({ loading: 0 });
    await waitForFonts(document.fonts, FONTS_TO_PRELOAD, FONT_LOAD_TIMEOUT_MS);
    uiStore.set({ loading: null });
    const area = new URLSearchParams(location.search).get('area');
    if (area && AREA_ID_PATTERN.test(area)) {
      this.target.goto(area);
      void engine.start(SCENE.world);
    } else void engine.start(SCENE.title);
  }
}
