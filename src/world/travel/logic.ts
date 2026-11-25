import type { AreaData, MapObject } from '../map/logic';
import { isI18nKey, type I18nKey } from '../../content/i18n';

export interface Destination {
  objectId: number;
  area: string;
  spawn: string;
}

export const destinationOf = (o: Pick<MapObject, 'id' | 'props'>): Destination | null =>
  typeof o.props.targetArea === 'string' && typeof o.props.targetSpawn === 'string'
    ? { objectId: o.id, area: o.props.targetArea, spawn: o.props.targetSpawn }
    : null;

export function edgeAt(area: AreaData, x: number, y: number): Destination | null {
  for (const o of area.objects) {
    if (o.kind !== 'edge') continue;
    if (x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h) return destinationOf(o);
  }
  return null;
}

export function doorById(area: AreaData, id: number): Destination | null {
  const o = area.objects.find((d) => d.id === id && d.kind === 'door');
  return o ? destinationOf(o) : null;
}

export function enteredEdge(
  area: AreaData,
  x: number,
  y: number,
  previous: number | null,
): { edge: Destination | null; inside: number | null } {
  const edge = edgeAt(area, x, y);
  const inside = edge?.objectId ?? null;
  return { edge: edge && edge.objectId !== previous ? edge : null, inside };
}

export const placeKey = (areaId: string): I18nKey | null => {
  const key = `place.${areaId.replace(/_(\w)/g, (_, c: string) => c.toUpperCase())}`;
  return isI18nKey(key) ? key : null;
};

export function neighbours(area: Pick<AreaData, 'id' | 'objects'>): string[] {
  const out = new Set<string>();
  for (const o of area.objects) {
    if (o.kind !== 'door' && o.kind !== 'edge') continue;
    const d = destinationOf(o);
    if (d && d.area !== area.id) out.add(d.area);
  }
  return [...out];
}
