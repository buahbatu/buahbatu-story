import { MapBuilder } from './lib.ts';

const m = new MapBuilder(48, 36, 7, { sky: '#b9d3e3', fog: '#dfe9ee', fogNear: 16, fogFar: 46 });
m.sprinkle('grass_flowers', 0.05)
  .raise(1, 0, 0, 21, 8)
  .raise(2, 0, 0, 13, 4)
  .raise(1, 27, 0, 21, 8)
  .raise(2, 34, 0, 14, 4)
  .paint('dirt', 21, 0, 6, 8)
  .paint('path', 23, 0, 2, 20)
  .paint('path', 0, 18, 48, 2)
  .paint('path', 9, 16, 1, 2)
  .paint('path', 36, 15, 1, 3)
  .paint('dirt', 3, 21, 19, 1)
  .paint('path', 11, 20, 1, 2)
  .farmland(4, 23, 4, 6)
  .farmland(10, 23, 4, 6)
  .farmland(16, 23, 4, 6)
  .paint('dirt', 29, 28, 16, 7)
  .paint('path', 31, 20, 1, 7)
  .paint('path', 31, 26, 6, 1)
  .ellipse('water', 25, 30, 3, 2.3, 'sand');

m.object('spawn', 23.5, 21.5, { id: 'start' })
  .object('spawn', 46, 19, { id: 'dari_dago' })
  .object('spawn', 24, 1.5, { id: 'dari_tangkuban' })
  .object('spawn', 9.5, 17, { id: 'depan_toko_bibit' })
  .object('spawn', 36.5, 16.8, { id: 'depan_rumah_asep' })
  .object('spawn', 36.5, 26.6, { id: 'depan_kandang' })
  .object('spawn', 11.5, 21.5, { id: 'kebun' })
  .object('edge', 47.5, 18, { targetArea: 'dago', targetSpawn: 'dari_lembang' }, 0.5, 2)
  .object('edge', 22, 0, { targetArea: 'tangkuban', targetSpawn: 'dari_lembang' }, 4, 0.5)
  .object('zone', 4, 23, { name: 'farm:kebun_warga' }, 16, 6)
  .object('npc_anchor', 33.5, 16.5, { id: 'kang_asep_rumah' })
  .object('npc_anchor', 11, 16.5, { id: 'kang_asep_toko' });

m.building(
  9.5,
  13,
  6,
  4.5,
  {
    wall: 'plaster',
    wallColor: '#d6e8b8',
    roof: 'hip',
    roofColor: '#3f6e4a',
    awning: '#3f8f4a',
    sign: 'sign.tokoBibit',
    signColor: '#3f6e4a',
    windows: 2,
    trim: '#f4f1ea',
  },
  { targetArea: 'toko_bibit', targetSpawn: 'pintu' },
)
  .building(
    36.5,
    12.5,
    6,
    5,
    {
      wall: 'planks',
      roof: 'gable',
      roofColor: '#7a3b2e',
      porch: true,
      shutters: '#4f8a5a',
      windows: 2,
      trim: '#e8dcc2',
      doorColor: '#5a341b',
    },
    { targetArea: 'rumah_kang_asep', targetSpawn: 'pintu' },
  )
  .building(
    37,
    23.5,
    8,
    4.5,
    {
      wall: 'planks',
      roof: 'gable',
      zinc: true,
      windows: 3,
      trim: '#a63a32',
      doorColor: '#a63a32',
      sign: 'sign.peternakan',
      signColor: '#a63a32',
    },
    { targetArea: 'kandang_sapi', targetSpawn: 'pintu', doorX: -0.5 },
  );

m.fence(3, 22.5, 10.5, 22.5)
  .fence(12.5, 22.5, 21, 22.5)
  .fence(3, 22.5, 3, 30)
  .fence(21, 22.5, 21, 30)
  .fence(3, 30, 21, 30)
  .fence(29, 27.5, 35.5, 27.5)
  .fence(37.5, 27.5, 45, 27.5)
  .fence(29, 27.5, 29, 35)
  .fence(45, 27.5, 45, 35)
  .prop('strawberry_plot', 6, 26, { cols: 3, rows: 5 })
  .prop('sign', 7.5, 21.6, { text: 'sign.kebunWarga', color: '#6b4223' })
  .prop('sign', 44.5, 17.2, { text: 'sign.lembang', color: '#2f5d50' })
  .prop('sign', 30, 25.2, { text: 'sign.susuMurni', color: '#3f6e9a' })
  .object('interact', 13, 21, { action: 'board:kebun_warga' }, 1, 1);
for (const [x, y] of [
  [31, 30],
  [33, 33],
  [42, 30],
  [40, 33.5],
] as const)
  m.solid('haystack', x, y, 1.4);
m.solid('haystack', 41, 17, 1.4)
  .solid('pot', 7, 15.8, 0.5, { flower: '#f2c94c' })
  .solid('pot', 12, 15.8, 0.5, { flower: '#e04a5a' })
  .solid('bench', 39.5, 16.6, 1)
  .solid('rock', 19, 33, 1, { scale: 1.3 })
  .solid('rock', 27, 31.5, 0.8)
  .solid('rock', 2, 33, 1, { scale: 1.1 });
for (let x = 4; x < 48; x += 9) m.solid('power_pole', x, 17.3, 0.3);
for (const [x, y, s] of [
  [2, 2, 1.3],
  [6, 1.5, 1.1],
  [10, 2.5, 1.2],
  [3, 6, 1],
  [8, 6.5, 1.1],
  [14, 5, 1],
  [18, 2, 1.2],
  [18, 6.5, 0.9],
  [29, 2, 1.1],
  [32, 6, 1],
  [36, 2, 1.3],
  [40, 1.5, 1.2],
  [44, 2.5, 1.1],
  [38, 6.5, 1],
  [43, 6.5, 0.9],
  [46, 5, 1.2],
  [1.5, 11, 1],
  [46, 11, 1.1],
  [1.5, 27, 1],
  [46.5, 25, 1],
] as const)
  m.tree('pine', x, y, s);
for (const [x, y, s] of [
  [17, 13, 1.1],
  [28, 12, 1],
  [26.5, 25, 1],
  [21.5, 33.5, 1.2],
] as const)
  m.tree('tree', x, y, s);
for (const [x, y, f] of [
  [5, 16, '#f6f0ff'],
  [14.5, 16, ''],
  [31, 16, '#e04a5a'],
  [42.5, 13, ''],
  [26, 22, '#f2c94c'],
  [1.5, 21, ''],
] as const)
  m.solid('bush', x, y, 0.9, { flowers: f });
m.write('lembang');
