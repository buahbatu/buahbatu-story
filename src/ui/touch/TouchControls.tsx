import { useRef, useState } from 'preact/hooks';
import { TOUCH_CONTROLS } from '../../config/controls';
import { t } from '../../content/i18n';
import type { Action } from '../../input';
import { readStick, stickRuns } from '../../input/stick';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';
import { touchAction, touchStick } from './bridge';

const unit = (n: number) => `calc(var(--px) * ${n})`;

const capture = (e: PointerEvent) => {
  try {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  } catch {
    return;
  }
};

function Stick() {
  const zone = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ id: number; ox: number; oy: number; kx: number; ky: number } | null>(null);
  const local = (e: PointerEvent) => {
    const r = zone.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  };
  const radius = () => {
    const px = parseFloat(getComputedStyle(zone.current ?? document.documentElement).getPropertyValue('--px')) || 1;
    return TOUCH_CONTROLS.radius * px;
  };
  const apply = (dx: number, dy: number) => {
    const s = readStick(dx, dy, { radius: radius(), deadZone: TOUCH_CONTROLS.deadZone });
    touchStick({ x: s.x, y: s.y });
    touchAction('run', stickRuns(s, TOUCH_CONTROLS.runAt));
    return s;
  };
  const end = (e: PointerEvent) => {
    if (state?.id !== e.pointerId) return;
    touchStick({ x: 0, y: 0 });
    touchAction('run', false);
    setState(null);
  };
  return (
    <div
      ref={zone}
      class="touch-stick-zone interactive"
      aria-label={t('touch.stick')}
      onPointerDown={(e) => {
        if (state) return;
        capture(e);
        const p = local(e);
        setState({ id: e.pointerId, ox: p.x, oy: p.y, kx: 0, ky: 0 });
        apply(0, 0);
      }}
      onPointerMove={(e) => {
        if (state?.id !== e.pointerId) return;
        const p = local(e);
        const s = apply(p.x - state.ox, p.y - state.oy);
        setState({ ...state, kx: s.knobX, ky: s.knobY });
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div class={state ? 'touch-stick active' : 'touch-stick'} style={state ? { left: `${state.ox}px`, top: `${state.oy}px` } : undefined}>
        <div class="touch-knob" style={state ? { transform: `translate(${state.kx}px, ${state.ky}px)` } : undefined} />
      </div>
    </div>
  );
}

function Button({ action, keyText, label, size }: { action: Action; keyText: string; label: string; size: number }) {
  const [down, setDown] = useState(false);
  const release = () => {
    setDown(false);
    touchAction(action, false);
  };
  return (
    <button
      type="button"
      class={down ? `touch-btn touch-${action} down` : `touch-btn touch-${action}`}
      style={{ width: unit(size), height: unit(size) }}
      aria-label={label}
      onPointerDown={(e) => {
        capture(e);
        setDown(true);
        touchAction(action, true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {keyText && <span class="touch-key">{keyText}</span>}
      <span class="touch-label">{label}</span>
    </button>
  );
}

export function TouchControls() {
  const touch = useStore(uiStore, (s) => s.touch);
  if (!touch) return null;
  return (
    <div class="touch-controls">
      <Stick />
      <div class="touch-buttons">
        {TOUCH_CONTROLS.buttons.map((b) => (
          <Button key={b.action} action={b.action} keyText={b.key} label={t(b.label)} size={b.size} />
        ))}
      </div>
    </div>
  );
}
