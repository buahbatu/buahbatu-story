import { t } from '../../content/i18n';
import { SPRITES, spriteRects, type SpriteName } from './sprites';

const ARC = 1.3;
const TILT = 3;

export function Pixel({ name, size, class: cls }: { name: SpriteName; size: number; class?: string }) {
  const rows = SPRITES[name];
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      class={cls}
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      style={{ width: `calc(var(--px) * ${String(w * size)})`, height: `calc(var(--px) * ${String(h * size)})` }}
      shape-rendering="crispEdges"
      aria-hidden="true"
    >
      {spriteRects(rows).map((r) => (
        <rect key={`${String(r.x)}-${String(r.y)}`} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.color} />
      ))}
    </svg>
  );
}

export function GameLogo() {
  const word = Array.from(t('title.logoTop'));
  const mid = (word.length - 1) / 2;
  return (
    <div class="logo" role="img" aria-label={t('game.title')}>
      <div class="logo-drop">
        <div class="logo-sway">
          <Pixel name="leaf" size={2} class="logo-deco leaf-l" />
          <Pixel name="leaf" size={2} class="logo-deco leaf-r" />
          <Pixel name="berry" size={2} class="logo-deco berry-l" />
          <Pixel name="berry" size={2} class="logo-deco berry-r" />
          <Pixel name="flower" size={2} class="logo-deco flower-l" />
          <Pixel name="daisy" size={2} class="logo-deco flower-r" />
          <Pixel name="sparkle" size={2} class="logo-deco spark spark-1" />
          <Pixel name="sparkle" size={2} class="logo-deco spark spark-2" />
          <Pixel name="sparkle" size={2} class="logo-deco spark spark-3" />
          <div class="logo-word" aria-hidden="true">
            {word.map((ch, i) => (
              <span
                key={`${ch}-${String(i)}`}
                class="logo-letter"
                style={{
                  '--i': i,
                  transform: `translateY(calc(var(--px) * ${((i - mid) ** 2 * ARC).toFixed(2)})) rotate(${((i - mid) * TILT).toFixed(1)}deg)`,
                }}
              >
                <span class="logo-bob">
                  <span class="logo-glyph" data-ch={ch}>
                    {ch}
                  </span>
                </span>
              </span>
            ))}
          </div>
          <div class="logo-sign" aria-hidden="true">
            <span class="logo-rope rope-l" />
            <span class="logo-rope rope-r" />
            <span class="logo-plank">{t('title.logoBottom')}</span>
          </div>
        </div>
      </div>
      <Pixel name="butterfly" size={2} class="logo-butterfly" />
    </div>
  );
}
