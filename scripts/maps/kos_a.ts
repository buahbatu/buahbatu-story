import { MapBuilder } from './lib.ts';

const m = new MapBuilder(7, 6, 5, { interior: true, cameraDistance: 11.5 });
m.paint('wood_floor', 0, 0, 7, 6)
  .prop('room', 3.5, 3, { w: 7, d: 6, wallColor: '#e9efe0', trim: '#6b4223' })
  .object('spawn', 3.5, 4.9, { id: 'pintu' })
  .object('spawn', 2.3, 2.4, { id: 'kasur' })
  .exit(3.5, 6, 'dago', 'dari_kos_a')
  .object('interact', 0.9, 1.2, { action: 'bed' }, 1.3, 2.1)
  .item('bed', 0.9, 1.2, 1.3, 2.1, { color: '#3f6e9a' })
  .item('wardrobe', 6.1, 0.4, 1.4, 0.6)
  .item('desk', 3.7, 0.45, 1.4, 0.7)
  .item('chair', 3.7, 1.3, 0.5, 0.5, { rotation: 180 })
  .item('bookshelf', 6.75, 2.6, 0.4, 1.2, { rotation: 90 })
  .prop('rug', 3.6, 3.4, { w: 2.6, d: 1.6, color: '#3f6e9a' })
  .prop('wall_window', 2.2, 0, { curtain: '#9cc8e8' })
  .prop('wall_frame', 4.9, 0, { color: '#f2c94c' })
  .solid('pot', 0.45, 5.4, 0.5, { flower: '#f2c94c' });
m.write('kos_a');
