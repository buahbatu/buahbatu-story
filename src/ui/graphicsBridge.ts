import type { GraphicsRuntime } from '../render/setup';
import type { AudioRuntime } from '../systems/audio/runtime';
import { uiStore } from './uiState';

export function connectGraphics(runtime: GraphicsRuntime): () => void {
  uiStore.set({ graphics: runtime.settings });
  return uiStore.subscribe(({ graphics }) => {
    if (graphics && graphics !== runtime.settings) runtime.update(graphics);
  });
}

export function connectAudio(runtime: AudioRuntime): () => void {
  uiStore.set({ audio: runtime.settings });
  return uiStore.subscribe(({ audio }) => {
    if (audio && audio !== runtime.settings) runtime.update(audio);
  });
}
