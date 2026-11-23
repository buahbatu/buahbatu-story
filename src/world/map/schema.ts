import { z } from 'zod';
import { TILE_PX } from '../../config/world';

const int = z.number().int();
const value = z.union([z.string(), z.number(), z.boolean()]);
const properties = z.array(z.object({ name: z.string(), type: z.string().optional(), value })).optional();

const tileLayer = z.object({
  type: z.literal('tilelayer'),
  name: z.string(),
  width: int.positive(),
  height: int.positive(),
  data: z.array(int.nonnegative()),
});
const mapObject = z.object({
  id: int,
  name: z.string().default(''),
  type: z.string().optional(),
  class: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative().default(0),
  height: z.number().nonnegative().default(0),
  point: z.boolean().optional(),
  properties,
});
const objectLayer = z.object({ type: z.literal('objectgroup'), name: z.string(), objects: z.array(mapObject) });
const tileset = z.object({
  firstgid: int.positive(),
  name: z.string(),
  image: z.string(),
  tilewidth: z.literal(TILE_PX),
  tileheight: z.literal(TILE_PX),
  columns: int.positive(),
  tilecount: int.positive(),
  imagewidth: int.positive(),
  imageheight: int.positive(),
  tiles: z.array(z.object({ id: int.nonnegative(), properties })).optional(),
});

export const tiledMapSchema = z.object({
  type: z.literal('map'),
  orientation: z.literal('orthogonal'),
  infinite: z.literal(false),
  width: int.positive(),
  height: int.positive(),
  tilewidth: z.literal(TILE_PX),
  tileheight: z.literal(TILE_PX),
  layers: z.array(z.discriminatedUnion('type', [tileLayer, objectLayer])),
  tilesets: z.array(tileset).min(1),
});

export type TiledMap = z.infer<typeof tiledMapSchema>;
export type TiledObject = z.infer<typeof mapObject>;
export type PropertyValue = z.infer<typeof value>;
