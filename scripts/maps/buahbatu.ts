import { MapBuilder } from './lib.ts';

const m = new MapBuilder(44, 34, 11, { sky: '#a8d0ee', fog: '#e8dcc8', fogNear: 32, fogFar: 72 });
m.sprinkle('grass_flowers', 0.04)
  .paint('paving', 0, 10, 44, 2)
  .paint('asphalt', 0, 12, 44, 4)
  .paint('paving', 0, 16, 44, 2)
  .paint('paving', 20, 18, 2, 16)
  .paint('paving', 0, 24, 44, 1)
  .paint('paving', 0, 32, 31, 1)
  .paint('grass_flowers', 31, 26, 12, 7)
  .paint('path', 31, 28, 12, 1)
  .paint('path', 36, 26, 1, 7)
  .ellipse('water', 40, 30.5, 2, 1.4, 'sand');

m.object('spawn', 21, 19.5, { id: 'start' })
  .object('spawn', 1.5, 14, { id: 'dari_gedung_sate' })
  .object('spawn', 6, 30.9, { id: 'depan_rumah_michelle' })
  .object('spawn', 13, 10.6, { id: 'depan_warung' })
  .object('spawn', 36.5, 27, { id: 'taman' })
  .object('edge', 0, 12, { targetArea: 'gedung_sate', targetSpawn: 'dari_buahbatu' }, 0.5, 4)
  .object('zone', 31, 26, { name: 'park:taman_kompleks' }, 12, 7)
  .object('npc_anchor', 4.5, 30.6, { id: 'mamah_michelle_teras' })
  .object('npc_anchor', 12, 17.2, { id: 'pedagang_batagor' });

m.building(5, 7.5, 5, 4, {
  wall: 'brick',
  floors: 2,
  roof: 'flat',
  roofColor: '#7a4a2a',
  awning: '#3b2a20',
  sign: 'sign.kopi',
  signColor: '#3b2a20',
  windows: 2,
  trim: '#e8dcc2',
  doorColor: '#2f2620',
})
  .building(
    12,
    7.5,
    5,
    4,
    {
      wall: 'bamboo',
      roof: 'gable',
      zinc: true,
      awning: '#3f8f4a',
      sign: 'sign.warungSunda',
      signColor: '#3f6e4a',
      windows: 2,
      trim: '#7a4a28',
    },
    { targetArea: 'warung_buahbatu', targetSpawn: 'pintu' },
  )
  .building(18.5, 7.8, 4, 3.6, {
    wall: 'plaster',
    wallColor: '#bfe0ef',
    roof: 'flat',
    roofColor: '#3f7fc4',
    sign: 'sign.laundry',
    signColor: '#3f7fc4',
    windows: 1,
  })
  .building(24, 7.8, 4, 3.6, {
    wall: 'plaster',
    wallColor: '#f6c9d3',
    roof: 'hip',
    roofColor: '#8e2f2a',
    awning: '#d9534a',
    sign: 'sign.konter',
    signColor: '#d9534a',
    windows: 1,
  })
  .building(30, 7.5, 5, 4, {
    wall: 'plaster',
    wallColor: '#fde6a6',
    roof: 'gable',
    roofColor: '#3f6e9a',
    awning: '#f2994a',
    sign: 'sign.seblak',
    signColor: '#d9534a',
    windows: 2,
    shutters: '#3f6e9a',
  })
  .building(37.5, 7, 6, 5, {
    wall: 'plaster',
    wallColor: '#d9c2e8',
    floors: 2,
    roof: 'hip',
    roofColor: '#5a4a7a',
    windows: 3,
    trim: '#f4f1ea',
    doorColor: '#5a4a7a',
  });

m.building(
  6,
  27.3,
  7,
  4.5,
  {
    wall: 'plaster',
    wallColor: '#fbe3c8',
    floors: 2,
    roof: 'hip',
    roofColor: '#c9473d',
    porch: true,
    ac: true,
    shutters: '#4f8a5a',
    windows: 3,
    trim: '#ffffff',
    doorColor: '#6b4223',
  },
  { targetArea: 'rumah_michelle', targetSpawn: 'pintu' },
)
  .building(14, 27.3, 6, 4.5, {
    wall: 'plaster',
    wallColor: '#cfe8d0',
    roof: 'gable',
    roofColor: '#4a6a3a',
    windows: 2,
    trim: '#f4f1ea',
    shutters: '#6b4223',
  })
  .building(26, 27.3, 6, 4.5, { bars: true, wall: 'brick', roof: 'hip', roofColor: '#6b6f78', windows: 2, porch: true, trim: '#e8dcc2' })
  .building(5.5, 21, 6, 4.5, {
    bars: true,
    wall: 'plaster',
    wallColor: '#f2f0c4',
    roof: 'gable',
    roofColor: '#b5583d',
    windows: 2,
    trim: '#ffffff',
  })
  .building(13.5, 21, 6, 4.5, {
    wall: 'plaster',
    wallColor: '#e3d3f0',
    floors: 2,
    roof: 'flat',
    roofColor: '#9a8fb0',
    windows: 2,
    trim: '#ffffff',
    doorColor: '#3b3f45',
  })
  .building(28, 21, 7, 4.5, { wall: 'planks', roof: 'hip', roofColor: '#2f4a5a', windows: 3, shutters: '#d9534a', trim: '#f4f1ea' })
  .building(37.5, 21, 6, 4.5, {
    wall: 'plaster',
    wallColor: '#fcd3b4',
    roof: 'gable',
    roofColor: '#6b4223',
    windows: 2,
    trim: '#ffffff',
    shutters: '#3f6e9a',
  });

for (const [x0, x1, y] of [
  [2, 5, 31.6],
  [7, 10, 31.6],
  [10.5, 13, 31.6],
  [15, 18, 31.6],
  [22.5, 25, 31.6],
  [27, 30, 31.6],
  [2, 5, 23.8],
  [6.5, 9, 23.8],
  [10, 13, 23.8],
  [14.5, 17, 23.8],
  [24, 27.5, 23.8],
  [29, 31.5, 23.8],
  [34, 37, 23.8],
  [38.5, 41, 23.8],
] as const)
  m.fence(x0, y, x1, y, 'wall');
m.fence(31, 25.5, 31, 33, 'bamboo').fence(43, 25.5, 43, 33, 'bamboo');

m.prop('sign', 1.2, 17.4, { text: 'sign.buahbatu', color: '#3f6e9a' })
  .prop('sign', 34, 25.6, { text: 'sign.tamanKompleks', color: '#3f8f4a' })
  .solid('food_cart', 12, 17.1, 1.4, { color: '#d9534a', label: 'sign.batagor' })
  .solid('food_cart', 33, 10.9, 1.4, { color: '#3f6e9a', label: 'sign.cilok' })
  .solid('bench', 34, 29.5, 1)
  .solid('bench', 39, 27.2, 1)
  .solid('pot', 3, 30, 0.5, { flower: '#e04a5a' })
  .solid('pot', 9, 30, 0.5, { flower: '#f2c94c' })
  .solid('pot', 3.5, 10.6, 0.5, { flower: '#f6f0ff' })
  .solid('pot', 27.5, 10.6, 0.5, { flower: '#e04a5a' });
for (let x = 3; x < 44; x += 10) m.solid('street_lamp', x, 17.6, 0.3);
for (const x of [8.6, 15.5, 21.3, 27.2, 34]) m.solid('power_pole', x, 10.4, 0.3);
for (const [x, y, s] of [
  [2, 2, 1.1],
  [9, 1.5, 1],
  [16, 2.5, 1.2],
  [22, 1.5, 1],
  [28, 2.5, 1.1],
  [34, 1.5, 1.2],
  [41, 2.5, 1],
  [33, 31.5, 1.2],
  [42, 27, 1],
  [18.5, 32.5, 0.9],
] as const)
  m.tree('tree', x, y, s);
for (const [x, y, f] of [
  [10.5, 25.8, '#e04a5a'],
  [17.5, 25.8, ''],
  [23, 25.8, '#f6f0ff'],
  [33, 22.6, '#f2c94c'],
  [41.5, 25.8, ''],
  [37.5, 31.8, '#e04a5a'],
] as const)
  m.solid('bush', x, y, 0.9, { flowers: f });
m.write('buahbatu');
