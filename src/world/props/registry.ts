import type { Object3D } from 'three';
import { PROP_MODELS } from '../../config/world';
import type { Props } from '../map/logic';
import { farmhouse, fence, strawberryPlot, tree } from './models';

export type PropModel = (typeof PROP_MODELS)[number];

const num = (value: Props[string] | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const PROP_FACTORIES: Record<PropModel, (props: Props) => Object3D> = {
  farmhouse: () => farmhouse(),
  tree: (p) => tree(num(p.scale, 1)),
  fence: (p) => fence(num(p.length, 1)),
  strawberry_plot: (p) => strawberryPlot(num(p.cols, 4), num(p.rows, 3)),
};

export const isPropModel = (model: unknown): model is PropModel =>
  typeof model === 'string' && (PROP_MODELS as readonly string[]).includes(model);
