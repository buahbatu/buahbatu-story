import type { Object3D } from 'three';
import { PROP_MODELS } from '../../config/world';
import { isI18nKey, t } from '../../content/i18n';
import type { Props } from '../map/logic';
import { DEFAULT_BUILDING, ROOFS, WALLS, building, type BuildingSpec } from './buildings';
import { FENCE_STYLES, farmhouse, fence, strawberryPlot, tree } from './models';
import { bench, bush, foodCart, haystack, pine, pot, powerPole, rock, signBoard, streetLamp } from './street';

export type PropModel = (typeof PROP_MODELS)[number];
type Value = Props[string] | undefined;

const num = (value: Value, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const str = (value: Value, fallback: string) => (typeof value === 'string' && value !== '' ? value : fallback);
const oneOf = <T extends string>(options: readonly T[], value: Value, fallback: T): T => options.find((o) => o === value) ?? fallback;
export const TEXT_PROPS = ['sign', 'label', 'text'] as const;
const text = (value: Value) => (isI18nKey(value) ? t(value) : '');

function buildingSpec(p: Props): Partial<BuildingSpec> {
  const d = DEFAULT_BUILDING;
  return {
    w: num(p.w, d.w),
    d: num(p.d, d.d),
    floors: num(p.floors, d.floors),
    wall: oneOf(WALLS, p.wall, d.wall),
    wallColor: str(p.wallColor, d.wallColor),
    roof: oneOf(ROOFS, p.roof, d.roof),
    roofColor: str(p.roofColor, d.roofColor),
    zinc: p.zinc === true,
    trim: str(p.trim, d.trim),
    doorColor: str(p.doorColor, d.doorColor),
    doorX: num(p.doorX, d.doorX),
    windows: num(p.windows, d.windows),
    shutters: str(p.shutters, ''),
    awning: str(p.awning, ''),
    sign: text(p.sign),
    signColor: str(p.signColor, d.signColor),
    porch: p.porch === true,
  };
}

export const PROP_FACTORIES: Record<PropModel, (props: Props) => Object3D> = {
  farmhouse: () => farmhouse(),
  building: (p) => building(buildingSpec(p)),
  tree: (p) => tree(num(p.scale, 1)),
  pine: (p) => pine(num(p.scale, 1)),
  bush: (p) => bush(num(p.scale, 1), str(p.flowers, '')),
  rock: (p) => rock(num(p.scale, 1)),
  fence: (p) => fence(num(p.length, 1), oneOf(FENCE_STYLES, p.style, 'wood')),
  strawberry_plot: (p) => strawberryPlot(num(p.cols, 4), num(p.rows, 3)),
  haystack: () => haystack(),
  pot: (p) => pot(str(p.flower, '#e04a5a')),
  bench: () => bench(),
  street_lamp: () => streetLamp(),
  power_pole: () => powerPole(),
  food_cart: (p) => foodCart(str(p.color, '#d9534a'), text(p.label)),
  sign: (p) => signBoard(text(p.text), str(p.color, '#2f5d50')),
};

export const isPropModel = (model: unknown): model is PropModel =>
  typeof model === 'string' && (PROP_MODELS as readonly string[]).includes(model);
