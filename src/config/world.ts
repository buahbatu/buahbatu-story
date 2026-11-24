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
export const WORLD_CAMERA = { fov: 30, pitchDeg: 40, distance: 13, near: 0.5, far: 120 } as const;
export const DEFAULT_AREA = 'sandbox';
export const AREA_ID_PATTERN = /^[a-z0-9_]+$/;
export const WORLD_SKIRT = 40;
export const INTERIOR = { background: '#14111f', fogNear: 60, fogFar: 120, cameraDistance: 15, lookBack: 0.9 } as const;
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
  } as Record<string, { texture: 'leaves' | 'bark' | 'rock'; tint: string }>,
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
