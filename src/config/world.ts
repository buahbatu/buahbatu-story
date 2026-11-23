export const TILE_PX = 16;
export const HEIGHT_STEP = 0.5;
export const MAP_LAYERS = ['Ground', 'Height', 'Farmable', 'Collision', 'Objects'] as const;
export const OBJECT_RULES = {
  spawn: ['id'],
  door: ['targetArea', 'targetSpawn'],
  edge: ['targetArea', 'targetSpawn'],
  interact: ['action'],
  npc_anchor: ['id'],
  zone: ['name'],
  road: [],
  bus_stop: ['stopId'],
  prop: ['model'],
} as const satisfies Record<string, readonly string[]>;
export const PROP_MODELS = ['farmhouse', 'tree', 'fence', 'strawberry_plot'] as const;
