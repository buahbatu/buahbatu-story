export const TILE_PX = 16;
export const HEIGHT_STEP = 1;
export const WATER_DEPTH = 0.2;
export const ATLAS_INSET = 0.01;
export const WORLD_CAMERA = { fov: 30, pitchDeg: 52, distance: 16, near: 0.5, far: 120 } as const;
export const DEFAULT_AREA = 'sandbox';
export const AREA_ID_PATTERN = /^[a-z0-9_]+$/;
export const WORLD_SKIRT = 40;
export const INTERIOR = { background: '#14111f', fogNear: 60, fogFar: 120, cameraDistance: 15, lookBack: 0.9 } as const;
export const CHARACTER_SPRITE = { height: 1.7, lean: 0.5, shadowRadius: 0.42 } as const;
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
