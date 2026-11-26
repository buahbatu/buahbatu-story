import type { GraphicsRuntime } from '../render/setup';
import { uiStore } from './uiState';

export function connectGraphics(runtime: GraphicsRuntime): () => void {
  uiStore.set({ graphics: runtime.settings });
  return uiStore.subscribe(({ graphics }) => {
    if (graphics && graphics !== runtime.settings) runtime.update(graphics);
  });
}
