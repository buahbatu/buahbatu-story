import { MapBuilder } from './lib.ts';

const m = new MapBuilder(40, 30, 21);
m.sprinkle('grass_flowers', 0.07)
  .paint('grass', 5, 3, 9, 8)
  .paint('path', 0, 15, 40, 2)
  .paint('path', 19, 0, 2, 30)
  .paint('path', 9, 10, 1, 5)
  .paint('stone', 7, 10, 5, 2)
  .farmland(23, 5, 9, 6)
  .ellipse('water', 31, 22, 4.5, 3.2, 'sand')
  .raise(1, 2, 19, 10, 9)
  .raise(2, 4, 22, 5, 4);
m.object('spawn', 20.5, 17.5, { id: 'start' })
  .object('spawn', 9.5, 12, { id: 'depan_rumah' })
  .object('spawn', 16.5, 20.5, { id: 'bukit' })
  .prop('farmhouse', 9.5, 7, { rotation: 0 })
  .block(6.5, 4.6, 6, 4.8)
  .object('door', 9, 9.5, { targetArea: 'sandbox', targetSpawn: 'depan_rumah' }, 1, 0.5)
  .prop('fence', 27.5, 4.5, { length: 9 })
  .prop('fence', 27.5, 11.5, { length: 9 })
  .object('interact', 22, 8, { action: 'shipping_bin' }, 1, 1)
  .object('zone', 26.5, 18.8, { name: 'fishing:pond' }, 9, 6.4);
for (const [x, y, s] of [
  [2, 2, 1.2],
  [15, 3, 1],
  [16, 9, 0.9],
  [3, 12, 1.1],
  [36, 3, 1.3],
  [37, 11, 1],
  [26, 14, 0.9],
  [14, 23, 1.2],
  [24, 27, 1.1],
  [38, 27, 1.2],
  [5, 21, 1],
  [10, 26, 1.1],
  [33, 13, 1],
] as const)
  m.tree('tree', x + 0.5, y + 0.5, s);
m.write('sandbox');
