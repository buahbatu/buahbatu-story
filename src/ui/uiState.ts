import type { SceneKey } from '../scenes/keys';
import { createStore } from './store';
import type { Toast } from './toasts';

export interface UiState {
  scene: SceneKey | null;
  toasts: Toast[];
}

export const uiStore = createStore<UiState>({ scene: null, toasts: [] });

export function setActiveScene(scene: SceneKey): void {
  uiStore.set({ scene });
}
