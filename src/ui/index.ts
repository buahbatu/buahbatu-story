import './styles/pixel.css';
import { createElement, render } from 'preact';
import { TOAST } from '../config/ui';
import type { EventBus } from '../core/events';
import { App } from './App';
import type { Store } from './store';
import { expireToasts, pushToast } from './toasts';
import { uiStore, type UiState } from './uiState';

export interface Clock {
  now(): number;
  setTimeout(callback: () => void, ms: number): unknown;
}

const browserClock: Clock = {
  now: () => performance.now(),
  setTimeout: (callback, ms) => window.setTimeout(callback, ms),
};

export function connectToasts(bus: EventBus, store: Store<UiState>, clock: Clock = browserClock): () => void {
  let nextId = 1;
  return bus.on('ui/toast', (event) => {
    const expiresAt = clock.now() + TOAST.durationMs;
    const toast = {
      id: nextId++,
      key: event.key,
      expiresAt,
      ...(event.params ? { params: event.params } : {}),
    };
    store.set((s) => ({ toasts: pushToast(s.toasts, toast, TOAST.maxVisible) }));
    clock.setTimeout(() => {
      store.set((s) => ({ toasts: expireToasts(s.toasts, clock.now()) }));
    }, TOAST.durationMs);
  });
}

export function mountUi(root: HTMLElement, bus: EventBus): void {
  render(createElement(App, null), root);
  connectToasts(bus, uiStore);
}
