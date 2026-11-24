import type { Choice, Dialog, DialogLine } from './schema';

export interface LogEntry {
  speaker: string;
  text: string;
}

export interface DialogState {
  dialogId: string;
  line: number;
  shown: number;
  choice: number;
  log: LogEntry[];
  done: boolean;
  vars: Readonly<Record<string, string>>;
}

export type DialogBook = ReadonlyMap<string, Dialog>;
export const PLAYER_SPEAKER = 'player';

export const fillVars = (text: string, vars: Readonly<Record<string, string>>): string =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);

export function startDialog(
  book: DialogBook,
  id: string,
  vars: Readonly<Record<string, string>> = {},
  log: LogEntry[] = [],
): DialogState | null {
  return book.has(id) ? { dialogId: id, line: 0, shown: 0, choice: 0, log, done: false, vars } : null;
}

export function lineOf(book: DialogBook, s: DialogState): DialogLine | null {
  return book.get(s.dialogId)?.lines[s.line] ?? null;
}

export function fullText(book: DialogBook, s: DialogState): string {
  const line = lineOf(book, s);
  return line && 'text' in line ? fillVars(line.text, s.vars) : '';
}

export function tick(book: DialogBook, s: DialogState, dt: number, cps: number): DialogState {
  const total = fullText(book, s).length;
  return s.shown >= total ? s : { ...s, shown: Math.min(total, s.shown + dt * cps) };
}

export function choicesOf(book: DialogBook, s: DialogState): readonly Choice[] {
  const line = lineOf(book, s);
  return line && 'choices' in line ? line.choices : [];
}

export function moveChoice(book: DialogBook, s: DialogState, delta: number): DialogState {
  const n = choicesOf(book, s).length;
  return n === 0 ? s : { ...s, choice: (((s.choice + delta) % n) + n) % n };
}

export function choose(book: DialogBook, s: DialogState, index: number): { state: DialogState; picked: Choice | null } {
  const picked = choicesOf(book, s)[index] ?? null;
  if (!picked) return { state: s, picked: null };
  const log = [...s.log, { speaker: PLAYER_SPEAKER, text: fillVars(picked.text, s.vars) }];
  const next = picked.next ? startDialog(book, picked.next, s.vars, log) : null;
  return { state: next ?? { ...s, log, done: true }, picked };
}

export function advance(book: DialogBook, s: DialogState): { state: DialogState; picked: Choice | null } {
  if (s.done) return { state: s, picked: null };
  const line = lineOf(book, s);
  if (!line) return { state: { ...s, done: true }, picked: null };
  if ('choices' in line) return choose(book, s, s.choice);
  const text = fillVars(line.text, s.vars);
  if (s.shown < text.length) return { state: { ...s, shown: text.length }, picked: null };
  const log = [...s.log, { speaker: line.speaker, text }];
  const total = book.get(s.dialogId)?.lines.length ?? 0;
  const nextLine = s.line + 1;
  return { state: nextLine >= total ? { ...s, log, done: true } : { ...s, log, line: nextLine, shown: 0, choice: 0 }, picked: null };
}

export const bookOf = (files: readonly (readonly Dialog[])[]): DialogBook => new Map(files.flat().map((d) => [d.id, d]));
