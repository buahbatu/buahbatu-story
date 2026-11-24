import { DIALOG } from '../../config/world';
import { isI18nKey, t } from '../../content/i18n';
import type { InputState } from '../../input/logic';
import { uiStore } from '../../ui/uiState';
import { HOTBAR_ACTIONS } from '../../input/actions';
import {
  advance,
  choicesOf,
  choose,
  fullText,
  lineOf,
  moveChoice,
  PLAYER_SPEAKER,
  startDialog,
  tick,
  type DialogBook,
  type DialogState,
  type LogEntry,
} from './logic';
import { drainDialogRequests } from './requests';

export const speakerName = (id: string): string => {
  const key = id === PLAYER_SPEAKER ? 'speaker.player' : `speaker.${id}`;
  return isI18nKey(key) ? t(key) : id;
};

export class DialogController {
  private state: DialogState | null = null;
  private history: LogEntry[] = [];
  private readonly book: DialogBook;

  constructor(book: DialogBook) {
    this.book = book;
  }

  get open(): boolean {
    return this.state !== null;
  }

  has(id: string): boolean {
    return this.book.has(id);
  }

  start(id: string, vars: Readonly<Record<string, string>> = {}): boolean {
    const s = startDialog(this.book, id, vars);
    if (!s) return false;
    this.state = s;
    this.sync();
    return true;
  }

  update(dt: number, input: InputState): void {
    const requests = drainDialogRequests();
    if (input.justPressed('log')) requests.push({ type: 'toggleLog' });
    let s = this.state;
    if (s) {
      if (input.justPressed('interact')) requests.push({ type: 'advance' });
      if (input.justPressed('up')) s = moveChoice(this.book, s, -1);
      if (input.justPressed('down')) s = moveChoice(this.book, s, 1);
      HOTBAR_ACTIONS.slice(0, 4).forEach((a, i) => {
        if (input.justPressed(a)) requests.push({ type: 'pick', index: i });
      });
    }
    for (const r of requests) {
      if (r.type === 'toggleLog') {
        uiStore.set({ dialogLogOpen: !uiStore.get().dialogLogOpen });
        continue;
      }
      if (!s) continue;
      const result =
        r.type === 'advance'
          ? advance(this.book, s)
          : choicesOf(this.book, s).length > 0
            ? choose(this.book, s, r.index)
            : advance(this.book, s);
      s = result.state;
    }
    if (s) s = tick(this.book, s, dt, DIALOG.cps);
    if (s?.done) {
      this.history = [...this.history, ...s.log].slice(-DIALOG.historySize);
      s = null;
    }
    this.state = s;
    this.sync();
  }

  private sync(): void {
    const s = this.state;
    const log = [...this.history, ...(s?.log ?? [])]
      .slice(-DIALOG.historySize)
      .map((e) => ({ speaker: speakerName(e.speaker), text: e.text }));
    if (!s) {
      if (uiStore.get().dialog !== null || uiStore.get().dialogLog.length !== log.length) uiStore.set({ dialog: null, dialogLog: log });
      return;
    }
    const line = lineOf(this.book, s);
    const text = fullText(this.book, s);
    const choices = choicesOf(this.book, s).map((c) => c.text.replace(/\{(\w+)\}/g, (m, n: string) => s.vars[n] ?? m));
    const speaker = line && 'speaker' in line ? line.speaker : PLAYER_SPEAKER;
    const portrait = line && 'portrait' in line ? (line.portrait ?? line.speaker) : PLAYER_SPEAKER;
    const next = {
      speaker: speakerName(speaker),
      portrait,
      text: text.slice(0, Math.floor(s.shown)),
      complete: Math.floor(s.shown) >= text.length,
      choices,
      choice: s.choice,
    };
    const cur = uiStore.get().dialog;
    if (
      cur?.text !== next.text ||
      cur.speaker !== next.speaker ||
      cur.choice !== next.choice ||
      cur.complete !== next.complete ||
      cur.choices.length !== next.choices.length ||
      uiStore.get().dialogLog.length !== log.length
    )
      uiStore.set({ dialog: next, dialogLog: log });
  }

  snapshot(): { open: boolean; dialogId: string | null; line: number; done: number } {
    return { open: this.open, dialogId: this.state?.dialogId ?? null, line: this.state?.line ?? -1, done: this.history.length };
  }
}
