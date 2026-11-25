import { describe, expect, it } from 'vitest';
import { DEFAULT_BINDINGS, TOUCH_CONTROLS } from '../config/controls';
import { InputState } from './logic';
import { readStick, stickRuns } from './stick';

const rules = { radius: 20, deadZone: 0.2 };

describe('readStick (joystick virtual)', () => {
  it('di dalam deadzone tidak bergerak tapi kenop tetap mengikuti jari', () => {
    expect(readStick(2, 1, rules)).toMatchObject({ x: 0, y: 0, power: 0, knobX: 2, knobY: 1 });
    expect(readStick(0, 0, rules)).toMatchObject({ x: 0, y: 0, power: 0, knobX: 0, knobY: 0 });
  });
  it('kenop tertahan di jari-jari, kekuatan maksimal 1', () => {
    const s = readStick(60, 0, rules);
    expect(s.knobX).toBe(20);
    expect(s.power).toBe(1);
    expect(s.x).toBe(1);
  });
  it('kekuatan naik bertahap setelah deadzone dan arah tetap', () => {
    const s = readStick(0, -12, rules);
    expect(s.power).toBeCloseTo(0.5);
    expect(s.y).toBeCloseTo(-0.5);
    expect(s.x).toBeCloseTo(0);
  });
  it('lari hanya saat stik didorong hampir penuh', () => {
    expect(stickRuns({ power: 1 }, TOUCH_CONTROLS.runAt)).toBe(true);
    expect(stickRuns({ power: 0.6 }, TOUCH_CONTROLS.runAt)).toBe(false);
  });
});

describe('InputState sumber virtual (sentuh)', () => {
  it('stik menggantikan vektor keyboard dan dipotong ke panjang 1', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.keyDown('KeyD');
    input.setStick({ x: 0, y: -0.4 });
    expect(input.move()).toEqual({ x: 0, y: -0.4 });
    input.setStick({ x: 3, y: 4 });
    expect(input.move().x).toBeCloseTo(0.6);
    input.setStick({ x: 0, y: 0 });
    expect(input.move()).toEqual({ x: 1, y: 0 });
  });
  it('tombol virtual memicu justPressed sekali dan bergabung dengan keyboard', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.setVirtual('interact', true);
    expect(input.justPressed('interact')).toBe(true);
    input.endFrame();
    input.keyDown('KeyE');
    expect(input.justPressed('interact')).toBe(false);
    input.setVirtual('interact', false);
    expect(input.isDown('interact')).toBe(true);
    expect(input.justReleased('interact')).toBe(false);
    input.keyUp('KeyE');
    expect(input.justReleased('interact')).toBe(true);
  });
  it('sumber berbeda untuk Action yang sama tidak saling menimpa (tombol Lari + stik)', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.setVirtual('run', true);
    input.setVirtual('run', false, 'stick');
    expect(input.isDown('run')).toBe(true);
    input.setVirtual('run', true, 'stick');
    input.setVirtual('run', false);
    expect(input.isDown('run')).toBe(true);
    input.setVirtual('run', false, 'stick');
    expect(input.isDown('run')).toBe(false);
  });
  it('pindah ke keyboard hanya melepas input sentuh, tombol keyboard tetap tertahan', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.keyDown('KeyD');
    input.setVirtual('jump', true);
    input.setStick({ x: 0, y: 1 });
    input.endFrame();
    input.releaseVirtual();
    expect(input.isDown('right')).toBe(true);
    expect(input.isDown('jump')).toBe(false);
    expect(input.justReleased('jump')).toBe(true);
    expect(input.justReleased('right')).toBe(false);
    expect(input.move()).toEqual({ x: 1, y: 0 });
  });
  it('releaseAll melepas tombol virtual & stik', () => {
    const input = new InputState(DEFAULT_BINDINGS);
    input.setVirtual('jump', true);
    input.setStick({ x: 1, y: 0 });
    input.endFrame();
    input.releaseAll();
    expect(input.isDown('jump')).toBe(false);
    expect(input.justReleased('jump')).toBe(true);
    expect(input.move()).toEqual({ x: 0, y: 0 });
  });
});
