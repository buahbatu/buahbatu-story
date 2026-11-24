import { z } from 'zod';
import { MAX_KEYS_PER_ACTION } from '../config/controls';
import { ACTIONS, type Action, type Bindings } from './actions';

export interface MoveVector {
  x: number;
  y: number;
}

export const bindingsSchema = z
  .object(
    Object.fromEntries(ACTIONS.map((a) => [a, z.array(z.string().min(1)).max(MAX_KEYS_PER_ACTION)])) as Record<
      Action,
      z.ZodArray<z.ZodString>
    >,
  )
  .superRefine((value, ctx) => {
    const seen = new Map<string, string>();
    for (const [action, keys] of Object.entries(value))
      for (const key of keys) {
        const owner = seen.get(key);
        if (owner) ctx.addIssue({ code: 'custom', message: `tombol ${key} dipakai ${owner} & ${action}` });
        seen.set(key, action);
      }
  });

export function rebind(bindings: Bindings, action: Action, key: string, slot = 0): Bindings {
  const next = Object.fromEntries(ACTIONS.map((a) => [a, bindings[a].filter((k) => k !== key)])) as Record<Action, string[]>;
  const keys = [...next[action]];
  keys.splice(Math.min(slot, keys.length), slot < keys.length ? 1 : 0, key);
  next[action] = keys.slice(0, MAX_KEYS_PER_ACTION);
  return next;
}

export class InputState {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<Action>();
  private readonly released = new Set<Action>();
  private byKey = new Map<string, Action>();
  private bindings: Bindings;
  private gesture = { zoom: 0, panX: 0, panY: 0, twist: 0 };

  constructor(bindings: Bindings) {
    this.bindings = bindings;
    this.setBindings(bindings);
  }

  setBindings(bindings: Bindings): void {
    this.bindings = bindings;
    this.byKey = new Map(ACTIONS.flatMap((a) => bindings[a].map((k) => [k, a] as const)));
    this.releaseAll();
  }

  actionOf(key: string): Action | undefined {
    return this.byKey.get(key);
  }

  keyDown(key: string): boolean {
    const action = this.byKey.get(key);
    if (!action) return false;
    if (!this.held.has(key)) {
      if (!this.isDown(action)) this.pressed.add(action);
      this.held.add(key);
    }
    return true;
  }

  keyUp(key: string): boolean {
    const action = this.byKey.get(key);
    if (!action || !this.held.delete(key)) return action !== undefined;
    if (!this.isDown(action)) this.released.add(action);
    return true;
  }

  releaseAll(): void {
    for (const key of this.held) {
      const action = this.byKey.get(key);
      if (action) this.released.add(action);
    }
    this.held.clear();
  }

  isDown(action: Action): boolean {
    return this.bindings[action].some((k) => this.held.has(k));
  }

  justPressed(action: Action): boolean {
    return this.pressed.has(action);
  }

  justReleased(action: Action): boolean {
    return this.released.has(action);
  }

  down(): Action[] {
    return ACTIONS.filter((a) => this.isDown(a));
  }

  move(): MoveVector {
    const x = Number(this.isDown('right')) - Number(this.isDown('left'));
    const y = Number(this.isDown('down')) - Number(this.isDown('up'));
    const len = Math.hypot(x, y);
    return len === 0 ? { x: 0, y: 0 } : { x: x / len, y: y / len };
  }

  addGesture(g: Partial<{ zoom: number; panX: number; panY: number; twist: number }>): void {
    this.gesture = {
      zoom: this.gesture.zoom + (g.zoom ?? 0),
      panX: this.gesture.panX + (g.panX ?? 0),
      panY: this.gesture.panY + (g.panY ?? 0),
      twist: this.gesture.twist + (g.twist ?? 0),
    };
  }

  gestures(): { zoom: number; panX: number; panY: number; twist: number } {
    return { ...this.gesture };
  }

  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
    this.gesture = { zoom: 0, panX: 0, panY: 0, twist: 0 };
  }
}
