export const TILE_PX = 16;
export const HEIGHT_STEP = 1;
export const WATER_DEPTH = 0.55;
export const WATER = { surface: -0.14, opacity: 0.62, color: '#5aa6d6', flow: 0.05 } as const;
export const TERRAIN_LOOK = {
  jitter: 0.02,
  sideShade: 0.8,
  tuftDensity: 0.6,
  organic: ['grass', 'grass_flowers', 'dirt', 'sand', 'path'],
} as const;
export const SHADOW = { extent: 15, mapSize: 1024, bias: -0.0015 } as const;
export const ATLAS_INSET = 0.01;
export const WORLD_CAMERA = {
  fov: 30,
  pitchDeg: 40,
  distance: 13,
  near: 0.5,
  far: 120,
  minZoom: 0.55,
  maxZoom: 1.7,
  zoomStep: 0.12,
  keyZoom: 8,
  rotateSpeed: 2.2,
  follow: 9,
  recenter: 2.5,
  maxPan: 9,
  panPerPixel: 0.0018,
  edgeInset: 3,
} as const;
export const DEFAULT_AREA = 'sandbox';
export const AREA_ID_PATTERN = /^[a-z0-9_]+$/;
export const WORLD_SKIRT = 40;
export const INTERIOR = {
  background: '#14111f',
  fogNear: 60,
  fogFar: 120,
  cameraDistance: 15,
  lookBack: 0.9,
  minZoom: 0.7,
  maxZoom: 1.3,
} as const;
export const WATER_FX = {
  dryTime: 8,
  dripTime: 4,
  dripRate: 14,
  splashCount: 28,
  dropSize: 0.14,
  maxParticles: 160,
  gravity: 9.8,
  rippleEvery: 0.4,
  rippleLife: 0.9,
  rippleGrow: 1.8,
  drop: '#f4fbff',
  ripple: '#eef8ff',
  wetTint: '#6f84a8',
  wetAmount: 0.45,
  sink: 12,
} as const;
export const INTERACTION = { reach: 0.9, facingBias: 0.35, promptHeight: 1.6, headHeight: 2.1 } as const;
export const INTERACT_PROMPTS = {
  bed: 'prompt.sleep',
  shipping_bin: 'prompt.ship',
  board: 'prompt.read',
  shop: 'prompt.shop',
  enter: 'prompt.enter',
  exit: 'prompt.exit',
  use: 'prompt.use',
} as const;
export const TRAVEL = { fadeMs: 260 } as const;
export const DIALOG = { cps: 40, historySize: 60 } as const;
export const OCCLUSION = { opacity: 0.3, speed: 5, margin: 0.4, skip: ['room', 'rug', 'stairs'] } as const;
export const CHARACTER = { height: 1.6, turnSpeed: 16 } as const;
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
export const PROP_MODELS = [
  'farmhouse',
  'building',
  'tree',
  'pine',
  'bush',
  'rock',
  'fence',
  'strawberry_plot',
  'stairs',
  'haystack',
  'pot',
  'bench',
  'street_lamp',
  'power_pole',
  'food_cart',
  'sign',
  'room',
  'partition',
  'wall_window',
  'wall_frame',
  'bed',
  'wardrobe',
  'desk',
  'chair',
  'sofa',
  'tv',
  'coffee_table',
  'rug',
  'bookshelf',
  'kitchen',
  'fridge',
  'dining_table',
  'vanity',
] as const;
export type PropModel = (typeof PROP_MODELS)[number];
export const PROP_ASSETS = {
  tree: ['nature/tree_oak', 'nature/tree_default', 'nature/tree_detailed', 'nature/tree_fat'],
  pine: ['nature/tree_pineRoundA', 'nature/tree_pineTallA_detailed', 'nature/tree_pineDefaultA'],
  bush: ['nature/plant_bushDetailed', 'nature/plant_bushLarge', 'nature/flower_redA'],
  rock: ['nature/stone_largeA', 'nature/stone_largeB', 'nature/stone_largeC', 'nature/stone_largeD'],
  fence: ['nature/fence_simple'],
  pot: ['nature/pot_small', 'nature/flower_redA'],
  street_lamp: ['roads/light-curved'],
} as const satisfies Partial<Record<PropModel, readonly string[]>>;
export interface FurniturePart {
  file: string;
  size: readonly [number, number, number];
  at?: readonly [number, number, number];
  yaw?: number;
}
export interface FurnitureSpec {
  tint?: string;
  color?: string;
  parts: readonly FurniturePart[];
}
const F = (name: string) => `furniture/${name}`;
export const FURNITURE = {
  bed: { tint: 'carpet', color: '#9cc8e8', parts: [{ file: F('bedSingle'), size: [1.3, 0.95, 2.1] }] },
  wardrobe: { tint: 'wood', parts: [{ file: F('bookcaseClosedDoors'), size: [1.4, 2.1, 0.6] }] },
  desk: {
    parts: [
      { file: F('desk'), size: [1.4, 0.78, 0.7] },
      { file: F('laptop'), size: [0.45, 0.32, 0.36], at: [0.25, 0.78, -0.05] },
      { file: F('books'), size: [0.32, 0.22, 0.22], at: [-0.42, 0.78, -0.12] },
    ],
  },
  chair: { tint: 'wood', parts: [{ file: F('chair'), size: [0.5, 0.95, 0.5] }] },
  sofa: { tint: 'carpet', color: '#5a7fa8', parts: [{ file: F('loungeSofa'), size: [2.2, 0.9, 0.9] }] },
  tv: {
    parts: [
      { file: F('cabinetTelevision'), size: [1.8, 0.55, 0.5] },
      { file: F('televisionModern'), size: [1.3, 0.85, 0.16], at: [0, 0.55, -0.06] },
    ],
  },
  coffee_table: { parts: [{ file: F('tableCoffee'), size: [1.1, 0.45, 0.6] }] },
  bookshelf: {
    parts: [
      { file: F('bookcaseOpen'), size: [1.2, 1.8, 0.4] },
      { file: F('books'), size: [0.5, 0.3, 0.26], at: [-0.25, 0.08, 0] },
      { file: F('books'), size: [0.45, 0.3, 0.26], at: [0.2, 0.92, 0], yaw: Math.PI },
      { file: F('books'), size: [0.5, 0.3, 0.26], at: [-0.2, 1.34, 0] },
    ],
  },
  kitchen: {
    parts: [
      { file: F('kitchenCabinet'), size: [0.6, 0.9, 0.65], at: [-0.9, 0, 0] },
      { file: F('kitchenStove'), size: [0.6, 0.9, 0.65], at: [-0.3, 0, 0] },
      { file: F('kitchenSink'), size: [0.6, 0.98, 0.65], at: [0.3, 0, 0] },
      { file: F('kitchenCabinet'), size: [0.6, 0.9, 0.65], at: [0.9, 0, 0] },
      { file: F('kitchenCabinetUpper'), size: [1.2, 0.6, 0.35], at: [-0.6, 1.55, -0.15] },
      { file: F('kitchenCabinetUpper'), size: [1.2, 0.6, 0.35], at: [0.6, 1.55, -0.15] },
    ],
  },
  fridge: { parts: [{ file: F('kitchenFridge'), size: [0.75, 1.8, 0.7] }] },
  dining_table: {
    parts: [
      { file: F('table'), size: [1.6, 0.78, 0.9] },
      { file: F('chair'), size: [0.5, 0.95, 0.5], at: [-0.45, 0, -0.72] },
      { file: F('chair'), size: [0.5, 0.95, 0.5], at: [0.45, 0, -0.72] },
      { file: F('chair'), size: [0.5, 0.95, 0.5], at: [-0.45, 0, 0.72], yaw: Math.PI },
      { file: F('chair'), size: [0.5, 0.95, 0.5], at: [0.45, 0, 0.72], yaw: Math.PI },
    ],
  },
  vanity: {
    tint: 'wood',
    color: '#f4e3d3',
    parts: [
      { file: F('sideTableDrawers'), size: [1.1, 0.75, 0.45] },
      { file: F('bathroomMirror'), size: [0.6, 0.9, 0.1], at: [0, 0.75, -0.17] },
    ],
  },
  rug: { tint: 'carpet', color: '#c9473d', parts: [{ file: F('rugRectangle'), size: [2, 0.02, 1.5] }] },
} as const satisfies Partial<Record<PropModel, FurnitureSpec>>;
export const ASSET_LOOK = {
  colors: {
    leafsGreen: '#5c9a45',
    leafsDark: '#3d7448',
    woodBark: '#7a5436',
    woodBarkDark: '#5e4232',
    grass: '#5a9a48',
    stone: '#9c988f',
    dirt: '#8a6a48',
    wood: '#a0703f',
    woodDark: '#6e4a2c',
    _defaultMat: '#7a5436',
  } as Record<string, string>,
  size: { tree: 4, pine: 4.6, bush: 0.9, flower: 0.35, rock: 1.3, fence: 0.9, pot: 0.5, streetLamp: 3.4 },
  textures: {
    leafsGreen: { texture: 'leaves', tint: '#c4e0a8' },
    leafsDark: { texture: 'leaves', tint: '#9cc0a0' },
    grass: { texture: 'leaves', tint: '#d0e8b8' },
    woodBark: { texture: 'bark', tint: '#ffffff' },
    woodBarkDark: { texture: 'bark', tint: '#d8c8c0' },
    _defaultMat: { texture: 'bark', tint: '#ffffff' },
    stone: { texture: 'rock', tint: '#ffffff' },
    wood: { texture: 'planks', tint: '#f4dcc0' },
    woodDark: { texture: 'planks', tint: '#b89478' },
  } as Record<string, { texture: 'leaves' | 'bark' | 'rock' | 'planks'; tint: string }>,
  uvDensity: 3,
  jitter: 0.12,
  bamboo: { wood: '#c2ad5c', woodDark: '#9a8a45' },
  clay: { wood: '#b5583d', woodBarkDark: '#8e4a33', _defaultMat: '#6b4a32' },
} as const;
export const AREA_IDS = [
  'sandbox',
  'lembang',
  'dago',
  'buahbatu',
  'cihampelas',
  'braga',
  'gedung_sate',
  'alun_alun',
  'pasar_baru',
  'ciwidey',
  'situ_patenggang',
  'tangkuban',
  'udjo',
  'kampus',
  'sekolah',
  'bulan_madu',
  'kos_a',
  'rumah_michelle',
  'rumah_kang_asep',
  'toko_bibit',
  'kandang_sapi',
  'warung_buahbatu',
] as const;
