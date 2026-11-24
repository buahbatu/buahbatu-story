import { describe, expect, it } from 'vitest';
import { DEFAULT_BINDINGS } from '../config/controls';
import { ACTIONS } from './actions';
import { InputState, bindingsSchema, rebind } from './logic';

describe('DEFAULT_BINDINGS (docs/40 §6)', () => {
  it('semua Action punya tombol & tidak ada tombol ganda', () => {
    expect(bindingsSchema.safeParse(DEFAULT_BINDINGS).success).toBe(true);
    for (const a of ACTIONS) expect(DEFAULT_BINDINGS[a].length, a).toBeGreaterThan(0);
  });
  it('mengikuti tabel kontrol: WASD/panah, E, Spasi, Tab, Shift, F, V, B, 1–0', () => {
    expect(DEFAULT_BINDINGS.up).toEqual(['KeyW', 'ArrowUp']);
    expect(DEFAULT_BINDINGS.interact[0]).toBe('KeyE');
    expect(DEFAULT_BINDINGS.useTool).toEqual(['Space']);
    expect(DEFAULT_BINDINGS.phone).toEqual(['Tab']);
    expect(DEFAULT_BINDINGS.hotbar10).toEqual(['Digit0']);
  });
});

describe('InputState', () => {
  const make = () => new InputState(DEFAULT_BINDINGS);

  it('tombol tak terikat diabaikan, tombol terikat dilaporkan', () => {
    const input = make();
    expect(input.keyDown('KeyP')).toBe(false);
    expect(input.keyDown('KeyE')).toBe(true);
    expect(input.down()).toEqual(['interact']);
  });

  it('justPressed hanya di frame pertama; auto-repeat tidak memicu ulang', () => {
    const input = make();
    input.keyDown('Space');
    expect(input.justPressed('useTool')).toBe(true);
    input.endFrame();
    input.keyDown('Space');
    expect(input.justPressed('useTool')).toBe(false);
    expect(input.isDown('useTool')).toBe(true);
  });

  it('dua tombol untuk satu Action: lepas satu masih tertahan, lepas keduanya baru justReleased', () => {
    const input = make();
    input.keyDown('KeyW');
    input.keyDown('ArrowUp');
    input.endFrame();
    input.keyUp('KeyW');
    expect(input.isDown('up')).toBe(true);
    expect(input.justReleased('up')).toBe(false);
    input.keyUp('ArrowUp');
    expect(input.justReleased('up')).toBe(true);
    expect(input.justPressed('up')).toBe(false);
  });

  it('vektor gerak dinormalisasi; arah berlawanan saling meniadakan', () => {
    const input = make();
    input.keyDown('KeyD');
    expect(input.move()).toEqual({ x: 1, y: 0 });
    input.keyDown('KeyS');
    expect(input.move().x).toBeCloseTo(Math.SQRT1_2);
    expect(input.move().y).toBeCloseTo(Math.SQRT1_2);
    input.keyDown('KeyA');
    expect(input.move()).toEqual({ x: 0, y: 1 });
  });

  it('releaseAll (jendela kehilangan fokus) melepas semua & menandai justReleased', () => {
    const input = make();
    input.keyDown('KeyW');
    input.keyDown('ShiftLeft');
    input.releaseAll();
    expect(input.down()).toEqual([]);
    expect(input.justReleased('up')).toBe(true);
    expect(input.justReleased('run')).toBe(true);
  });

  it('setBindings mengganti tombol tanpa menyisakan tombol tertahan', () => {
    const input = make();
    input.keyDown('KeyW');
    input.setBindings(rebind(DEFAULT_BINDINGS, 'up', 'KeyI'));
    expect(input.isDown('up')).toBe(false);
    input.keyDown('KeyI');
    expect(input.isDown('up')).toBe(true);
  });
});

describe('rebind', () => {
  it('memindahkan tombol dari Action lain supaya tidak bentrok', () => {
    const next = rebind(DEFAULT_BINDINGS, 'interact', 'Space');
    expect(next.interact).toEqual(['Space', 'Enter']);
    expect(next.useTool).toEqual([]);
    expect(bindingsSchema.safeParse(next).success).toBe(true);
  });
  it('slot kedua menambah/mengganti tombol cadangan, maksimal 2', () => {
    expect(rebind(DEFAULT_BINDINGS, 'useTool', 'KeyJ', 1).useTool).toEqual(['Space', 'KeyJ']);
    expect(rebind(DEFAULT_BINDINGS, 'up', 'KeyI', 1).up).toEqual(['KeyW', 'KeyI']);
    expect(rebind(DEFAULT_BINDINGS, 'up', 'KeyI', 5).up).toEqual(['KeyW', 'ArrowUp']);
  });
  it('skema menolak tombol ganda antar Action', () => {
    const bad = { ...DEFAULT_BINDINGS, emote: ['KeyE'] };
    expect(bindingsSchema.safeParse(bad).success).toBe(false);
  });
});

describe('gestur kamera (scroll, seret, dua jari)', () => {
  it('dijumlahkan dalam satu frame lalu dikosongkan di endFrame', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.addGesture({ zoom: 1, panX: 5 });
    input.addGesture({ zoom: 0.5, panY: -2, twist: 0.1 });
    expect(input.gestures()).toEqual({ zoom: 1.5, panX: 5, panY: -2, twist: 0.1 });
    input.endFrame();
    expect(input.gestures()).toEqual({ zoom: 0, panX: 0, panY: 0, twist: 0 });
  });

  it('Q/R dan +/- punya tombol bawaan tanpa bentrok dengan Interaksi (E)', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    expect([input.actionOf('KeyQ'), input.actionOf('KeyR'), input.actionOf('KeyE')]).toEqual(['cameraLeft', 'cameraRight', 'interact']);
    expect([input.actionOf('Equal'), input.actionOf('Minus'), input.actionOf('KeyB'), input.actionOf('KeyG')]).toEqual([
      'zoomIn',
      'zoomOut',
      'jump',
      'decor',
    ]);
    expect(bindingsSchema.safeParse(DEFAULT_BINDINGS).success).toBe(true);
  });
});
