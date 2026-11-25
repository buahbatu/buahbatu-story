import { useRef, useState } from 'preact/hooks';
import { TOUCH_CONTROLS } from '../../config/controls';
import { t } from '../../content/i18n';
import type { Action } from '../../input';
import { readStick, stickRuns } from '../../input/stick';
import { uiStore } from '../uiState';
import { useStore } from '../useStore';
import { touchAction, touchStick } from './bridge';
import { Icon, type IconName } from './icons';

const unit = (n: number) => `calc(var(--px) * ${n})`;

const capture = (e: PointerEvent) => {
  try {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  } catch {
    return;
  }
};

function Stick() {
  const base = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ id: number; kx: number; ky: number } | null>(null);
  const read = (e: PointerEvent) => {
    const r = base.current?.getBoundingClientRect();
    const px = parseFloat(getComputedStyle(base.current ?? document.documentElement).getPropertyValue('--px')) || 1;
    const dx = e.clientX - ((r?.left ?? 0) + (r?.width ?? 0) / 2);
    const dy = e.clientY - ((r?.top ?? 0) + (r?.height ?? 0) / 2);
    const s = readStick(dx, dy, { radius: TOUCH_CONTROLS.radius * px, deadZone: TOUCH_CONTROLS.deadZone });
    touchStick({ x: s.x, y: s.y });
    touchAction('run', stickRuns(s, TOUCH_CONTROLS.runAt), 'stick');
    return s;
  };
  const end = (e: PointerEvent) => {
    if (state?.id !== e.pointerId) return;
    touchStick({ x: 0, y: 0 });
    touchAction('run', false, 'stick');
    setState(null);
  };
  return (
    <div
      class="touch-stick-zone interactive"
      aria-label={t('touch.stick')}
      onPointerDown={(e) => {
        if (state) return;
        capture(e);
        const s = read(e);
        setState({ id: e.pointerId, kx: s.knobX, ky: s.knobY });
      }}
      onPointerMove={(e) => {
        if (state?.id !== e.pointerId) return;
        const s = read(e);
        setState({ ...state, kx: s.knobX, ky: s.knobY });
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div ref={base} class={state ? 'touch-stick active' : 'touch-stick'}>
        <span class="touch-arrow n" />
        <span class="touch-arrow e" />
        <span class="touch-arrow s" />
        <span class="touch-arrow w" />
        <div class="touch-knob" style={state ? { transform: `translate(${state.kx}px, ${state.ky}px)` } : undefined} />
      </div>
    </div>
  );
}

function Button({ action, icon, label, size }: { action: Action; icon: IconName; label: string; size: number }) {
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
      <Icon name={icon} class="touch-icon" />
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
          <Button key={b.action} action={b.action} icon={b.icon} label={t(b.label)} size={b.size} />
        ))}
      </div>
    </div>
  );
}
