import type { Object3D } from 'three';
import { PROP_MODELS, type PropModel } from '../../config/world';
import { isI18nKey, t } from '../../content/i18n';
import type { Props } from '../map/logic';
import { DEFAULT_BUILDING, ROOFS, WALLS, building, type BuildingSpec } from './buildings';
import { farmhouse, strawberryPlot } from './models';
import { FENCE_STYLES, bush, fence, pine, pot, rock, streetLamp, tree } from './nature';
import {
  bed,
  bookshelf,
  chair,
  coffeeTable,
  desk,
  diningTable,
  fridge,
  kitchen,
  partition,
  room,
  rug,
  sofa,
  tv,
  vanity,
  wallFrame,
  wallWindow,
  wardrobe,
} from './furniture';
import { bench, foodCart, haystack, powerPole, signBoard } from './street';

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

export const PROP_FACTORIES: Record<PropModel, (props: Props, seed: number) => Object3D> = {
  farmhouse: () => farmhouse(),
  building: (p) => building(buildingSpec(p)),
  tree: (p, seed) => tree(num(p.scale, 1), seed),
  pine: (p, seed) => pine(num(p.scale, 1), seed),
  bush: (p, seed) => bush(num(p.scale, 1), str(p.flowers, ''), seed),
  rock: (p, seed) => rock(num(p.scale, 1), seed),
  fence: (p) => fence(num(p.length, 1), oneOf(FENCE_STYLES, p.style, 'wood')),
  strawberry_plot: (p) => strawberryPlot(num(p.cols, 4), num(p.rows, 3)),
  haystack: () => haystack(),
  pot: (p, seed) => pot(str(p.flower, '#e04a5a'), seed),
  bench: () => bench(),
  street_lamp: () => streetLamp(),
  power_pole: () => powerPole(),
  food_cart: (p) => foodCart(str(p.color, '#d9534a'), text(p.label)),
  sign: (p) => signBoard(text(p.text), str(p.color, '#2f5d50')),
  room: (p) => room(num(p.w, 6), num(p.d, 5), str(p.wallColor, '#f1e3c4'), str(p.trim, '#8a5a36')),
  partition: (p) => partition(num(p.length, 3), str(p.wallColor, '#f1e3c4'), str(p.trim, '#8a5a36')),
  wall_window: (p) => wallWindow(str(p.curtain, '#e8b4bc')),
  wall_frame: (p) => wallFrame(str(p.color, '#e8b4bc')),
  bed: (p) => bed(str(p.color, '#9cc8e8')),
  wardrobe: (p) => wardrobe(str(p.color, '#a8723f')),
  desk: () => desk(),
  chair: (p) => chair(str(p.color, '#8a5a36')),
  sofa: (p) => sofa(str(p.color, '#5a7fa8')),
  tv: () => tv(),
  coffee_table: () => coffeeTable(),
  rug: (p) => rug(num(p.w, 2), num(p.d, 1.5), str(p.color, '#c9473d')),
  bookshelf: () => bookshelf(),
  kitchen: () => kitchen(),
  fridge: () => fridge(),
  dining_table: () => diningTable(),
  vanity: () => vanity(),
};

export const isPropModel = (model: unknown): model is PropModel =>
  typeof model === 'string' && (PROP_MODELS as readonly string[]).includes(model);
