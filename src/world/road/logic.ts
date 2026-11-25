import { ROAD } from '../../config/world';
import type { Rect } from '../map/logic';

export type Axis = 'x' | 'y';

export interface RoadLayout {
  along: Axis;
  surface: Rect;
  dashes: Rect[];
  edges: Rect[];
  curbs: Rect[];
  walks: Rect[];
}

export interface RoadOptions {
  sidewalk: number;
  markings: boolean;
  curb: boolean;
  bounds: { width: number; height: number };
  extend: number;
}

interface Rules {
  dash: number;
  gap: number;
  line: number;
  edgeInset: number;
  curb: { width: number };
}

const span = (a: number, b: number, c0: number, c1: number, along: Axis): Rect =>
  along === 'x' ? { x: a, y: c0, w: b - a, h: c1 - c0 } : { x: c0, y: a, w: c1 - c0, h: b - a };

export function roadLayout(r: Rect, o: RoadOptions, rules: Rules = ROAD): RoadLayout {
  const along: Axis = r.w >= r.h ? 'x' : 'y';
  const [a0, a1, c0, c1, limit] =
    along === 'x' ? [r.x, r.x + r.w, r.y, r.y + r.h, o.bounds.width] : [r.y, r.y + r.h, r.x, r.x + r.w, o.bounds.height];
  const start = a0 <= 0 ? a0 - o.extend : a0;
  const end = a1 >= limit ? a1 + o.extend : a1;
  const surface = span(start, end, c0, c1, along);
  const dashes: Rect[] = [];
  const edges: Rect[] = [];
  if (o.markings) {
    const mid = (c0 + c1) / 2;
    const period = rules.dash + rules.gap;
    const first = a0 + rules.gap / 2 - Math.ceil((a0 - start) / period) * period;
    for (let p = first; p + rules.dash <= end; p += period)
      if (p >= start) dashes.push(span(p, p + rules.dash, mid - rules.line / 2, mid + rules.line / 2, along));
    edges.push(
      span(start, end, c0 + rules.edgeInset, c0 + rules.edgeInset + rules.line, along),
      span(start, end, c1 - rules.edgeInset - rules.line, c1 - rules.edgeInset, along),
    );
  }
  const cw = rules.curb.width;
  const curbs = o.curb ? [span(start, end, c0 - cw, c0, along), span(start, end, c1, c1 + cw, along)] : [];
  const walks: Rect[] = [];
  if (o.sidewalk > 0) {
    if (start < a0) walks.push(span(start, a0, c0 - o.sidewalk, c0, along), span(start, a0, c1, c1 + o.sidewalk, along));
    if (end > a1) walks.push(span(a1, end, c0 - o.sidewalk, c0, along), span(a1, end, c1, c1 + o.sidewalk, along));
  }
  return { along, surface, dashes, edges, curbs, walks };
}
