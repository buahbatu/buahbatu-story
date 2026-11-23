import type { I18nKey } from '../content/i18n';
import type { SceneKey } from '../scenes/keys';
import { createStore } from './store';
import type { Toast } from './toasts';

export interface UiState {
  scene: SceneKey | null;
  toasts: Toast[];
  loading: number | null;
  fatal: I18nKey | null;
}

export const uiStore = createStore<UiState>({ scene: null, toasts: [], loading: null, fatal: null });

export function setActiveScene(scene: SceneKey): void {
  uiStore.set({ scene });
}
