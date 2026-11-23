// Tipe Command, hasil, dan handler. Desain: docs/02-arsitektur.md §4, ADR-008, ADR-017
import type { Draft, Patch } from 'immer';

import type { I18nKey } from '../../content/i18n';
import type { GameEvent } from '../events';
import type { FlagValue, GameState, PlayerId } from '../state';

export interface SetFlagCommand {
  type: 'world/setFlag';
  by: PlayerId;
  key: string;
  value: FlagValue;
}

/** Semua perubahan state lewat Command (bisa dikirim lewat jaringan, bisa di-replay). */
export type Command = SetFlagCommand;
// ...tambah per sistem: | FarmTillCommand | ShopBuyCommand | ...

export type CommandType = Command['type'];
export type CommandOf<T extends CommandType> = Extract<Command, { type: T }>;

export interface CommandResult {
  ok: boolean;
  /** Kunci teks i18n untuk toast ramah saat gagal (docs/03 §6). */
  reason?: I18nKey;
  events: GameEvent[];
}

export interface DispatchResult extends CommandResult {
  /** Perubahan state (Immer patch) → bahan `state:patch` ke pasangan (P6-07). */
  patches: Patch[];
  /** Kebalikan `patches` → rollback prediksi klien (P6-05). */
  inversePatches: Patch[];
}

export type HandlerOutcome = { ok: true; events: GameEvent[] } | { ok: false; reason: I18nKey };

/**
 * Handler memutasi `draft` (Immer) lalu mengembalikan event. Kalau mengembalikan `reject(...)`
 * atau melempar error, semua mutasi dibatalkan. Handler TIDAK boleh menyentuh Phaser, DOM,
 * jaringan, Date.now(), atau Math.random() (pakai createRng(draft.world)).
 */
export type Handler<C extends Command> = (draft: Draft<GameState>, cmd: C) => HandlerOutcome;

/** Wajib lengkap: TypeScript menolak kalau ada jenis Command tanpa handler. */
export type HandlerMap = { [T in CommandType]: Handler<CommandOf<T>> };

export const succeed = (events: GameEvent[] = []): HandlerOutcome => ({ ok: true, events });
export const reject = (reason: I18nKey): HandlerOutcome => ({ ok: false, reason });
