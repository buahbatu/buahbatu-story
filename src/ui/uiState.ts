// State khusus tampilan (bukan GameState): scene aktif & toast. Ditulis oleh Phaser/EventBus,
// dibaca Preact. Desain: docs/02-arsitektur.md §6, ADR-005
import type { SceneKey } from '../scenes/keys';
import { createStore } from './store';
import type { Toast } from './toasts';

export interface UiState {
  scene: SceneKey | null;
  toasts: Toast[];
}

export const uiStore = createStore<UiState>({ scene: null, toasts: [] });

/** Dipanggil tiap scene Phaser di `create()` supaya overlay tahu layar apa yang aktif. */
export function setActiveScene(scene: SceneKey): void {
  uiStore.set({ scene });
}
