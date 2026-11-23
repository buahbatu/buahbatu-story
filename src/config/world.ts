export const TILE_PX = 16;
export const HEIGHT_STEP = 1;
export const WATER_DEPTH = 0.2;
export const ATLAS_INSET = 0.01;
export const WORLD_CAMERA = { fov: 30, pitchDeg: 52, distance: 24, near: 0.5, far: 120 } as const;
export const DEFAULT_AREA = 'sandbox';
export const AREA_ID_PATTERN = /^[a-z0-9_]+$/;
export const WORLD_SKIRT = 40;
export const WORLD_FOG = { near: 30, far: 70 } as const;
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
