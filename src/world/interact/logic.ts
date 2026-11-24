import { INTERACT_PROMPTS } from '../../config/world';
import type { Direction } from '../../entities/player/logic';
import type { AreaData, MapObject } from '../map/logic';

export type PromptKey = (typeof INTERACT_PROMPTS)[keyof typeof INTERACT_PROMPTS];

export interface Interactable {
  id: number;
  kind: 'door' | 'interact';
  action: string;
  prompt: PromptKey;
  x: number;
  y: number;
  distance: number;
}

const FACING: Record<Direction, [number, number]> = {
  n: [0, -1],
  ne: [Math.SQRT1_2, -Math.SQRT1_2],
  e: [1, 0],
  se: [Math.SQRT1_2, Math.SQRT1_2],
  s: [0, 1],
  sw: [-Math.SQRT1_2, Math.SQRT1_2],
  w: [-1, 0],
  nw: [-Math.SQRT1_2, -Math.SQRT1_2],
};

export function promptFor(o: Pick<MapObject, 'kind' | 'props'>, indoor: boolean): PromptKey {
  if (o.kind === 'door') return indoor ? INTERACT_PROMPTS.exit : INTERACT_PROMPTS.enter;
  const action = String(o.props.action ?? '');
  const base = action.split(':')[0] ?? '';
  return (
    (Object.hasOwn(INTERACT_PROMPTS, base) ? INTERACT_PROMPTS[base as keyof typeof INTERACT_PROMPTS] : undefined) ?? INTERACT_PROMPTS.use
  );
}

export function rectDistance(o: Pick<MapObject, 'x' | 'y' | 'w' | 'h'>, x: number, y: number): number {
  const dx = Math.max(o.x - x, 0, x - (o.x + o.w));
  const dy = Math.max(o.y - y, 0, y - (o.y + o.h));
  return Math.hypot(dx, dy);
}

export function nearestInteractable(
  area: AreaData,
  player: { x: number; y: number; facing: Direction },
  rules: { reach: number; facingBias: number },
): Interactable | null {
  const indoor = area.settings.interior === true;
  const [fx, fy] = FACING[player.facing];
  let best: { score: number; item: Interactable } | null = null;
  for (const o of area.objects) {
    if (o.kind !== 'door' && o.kind !== 'interact') continue;
    const distance = rectDistance(o, player.x, player.y);
    if (distance > rules.reach) continue;
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const len = Math.hypot(cx - player.x, cy - player.y) || 1;
    const facing = ((cx - player.x) * fx + (cy - player.y) * fy) / len;
    const score = distance - facing * rules.facingBias;
    if (best && best.score <= score) continue;
    best = {
      score,
      item: {
        id: o.id,
        kind: o.kind,
        action: String(o.props.action ?? o.props.targetArea ?? ''),
        prompt: promptFor(o, indoor),
        x: cx,
        y: cy,
        distance,
      },
    };
  }
  return best?.item ?? null;
}

export function keyLabel(code: string | undefined): string {
  if (!code) return '?';
  const named: Record<string, string> = { Space: 'Spasi', Enter: 'Enter', Tab: 'Tab', ShiftLeft: 'Shift', ShiftRight: 'Shift' };
  return named[code] ?? code.replace(/^(Key|Digit|Numpad)/, '');
}

export function dialogFor(action: string): string | null {
  const [kind, id] = action.split(':');
  return kind === 'board' && id ? `board_${id}` : null;
}
