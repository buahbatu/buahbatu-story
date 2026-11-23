// API test hook `window.__BB__` supaya E2E (Playwright) bisa "memainkan" game.
// Desain: docs/50-testing-deploy.md §2, ADR-013. TIDAK ikut di build production.
//
// Diimplementasikan bertahap sesuai sistemnya: press/walkTo (P1-03/P8-04), setTime (P2-01),
// setWeather (P2-05), teleport (P1-09).
import type { Command, DispatchResult } from '../core/commands';
import type { GameEvent } from '../core/events';
import type { GameState } from '../core/state';
import type { SceneKey } from '../scenes/keys';

export interface TestApi {
  /** Selesai saat layar judul tampil (scene & font siap). */
  ready(): Promise<void>;
  /** Snapshot state (salinan, read-only). */
  getState(): GameState;
  /** Jalankan Command langsung seperti dari input pemain. */
  dispatch(command: Command): DispatchResult;
  /** Mulai ulang state dengan seed RNG tertentu (deterministik). */
  setSeed(seed: number): void;
  /** Kirim event ke EventBus (mis. memunculkan toast untuk tes UI). */
  emit(event: GameEvent): void;
  /** Scene Phaser yang sedang aktif. */
  scene(): SceneKey | null;
  /** Bekukan/lanjutkan loop game supaya screenshot stabil. */
  freeze(on: boolean): void;
}

declare global {
  interface Window {
    __BB__?: TestApi;
  }
}
