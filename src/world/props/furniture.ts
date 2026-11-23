import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { box, color, textured, texturedBox } from './kit';
import { TEX } from './textures';

export const ROOM_HEIGHT = 2.6;
const WALL_T = 0.2;

export function room(w: number, d: number, wallColor = '#f1e3c4', trim = '#8a5a36'): Group {
  const g = new Group();
  const h = ROOM_HEIGHT;
  g.add(texturedBox(w + WALL_T * 2, h, WALL_T, TEX.plasterWhite(), 0.8, 0, h / 2, -d / 2 - WALL_T / 2, wallColor));
  for (const side of [-1, 1]) g.add(texturedBox(WALL_T, h, d, TEX.plasterWhite(), 0.8, side * (w / 2 + WALL_T / 2), h / 2, 0, wallColor));
  g.add(box(w, 0.14, 0.04, color(trim), 0, 0.07, -d / 2 + 0.02));
  for (const side of [-1, 1]) g.add(box(0.04, 0.14, d, color(trim), side * (w / 2 - 0.02), 0.07, 0));
  g.add(
    box(w + WALL_T * 2, 0.08, WALL_T + 0.04, color(trim), 0, h, -d / 2 - WALL_T / 2),
    box(WALL_T + 0.04, 0.08, d, color(trim), -(w / 2 + WALL_T / 2), h, 0),
  );
  g.add(box(WALL_T + 0.04, 0.08, d, color(trim), w / 2 + WALL_T / 2, h, 0));
  return g;
}

export function partition(length: number, wallColor = '#f1e3c4', trim = '#8a5a36'): Group {
  const g = new Group();
  g.add(texturedBox(length, ROOM_HEIGHT, WALL_T, TEX.plasterWhite(), 0.8, 0, ROOM_HEIGHT / 2, 0, wallColor));
  g.add(box(length, 0.08, WALL_T + 0.04, color(trim), 0, ROOM_HEIGHT, 0));
  for (const z of [-1, 1]) g.add(box(length, 0.14, 0.04, color(trim), 0, 0.07, z * (WALL_T / 2 + 0.02)));
  return g;
}

export function wallWindow(curtain = '#e8b4bc'): Group {
  const g = new Group();
  g.add(box(1.3, 1.1, 0.06, textured(TEX.window()), 0, 1.5, 0.02), box(1.5, 0.1, 0.12, color('#f3ead6'), 0, 0.92, 0.06));
  g.add(box(1.7, 0.06, 0.06, color('#6b4223'), 0, 2.15, 0.12));
  for (const x of [-0.72, 0.72]) g.add(box(0.36, 1.25, 0.05, color(curtain), x, 1.5, 0.12));
  return g;
}

export function wallFrame(tint = '#e8b4bc'): Group {
  const g = new Group();
  g.add(
    box(0.7, 0.55, 0.05, color('#6b4223'), 0, 1.6, 0.02),
    box(0.56, 0.42, 0.03, color(tint), 0, 1.6, 0.05),
    box(0.2, 0.15, 0.02, color('#fff7e6'), -0.08, 1.64, 0.07),
  );
  return g;
}

export function bed(sheet = '#9cc8e8'): Group {
  const g = new Group();
  g.add(texturedBox(1.3, 0.35, 2.1, TEX.planks(), 1.2, 0, 0.18, 0), box(1.2, 0.22, 2, color('#f6f2ea'), 0, 0.46, 0.02));
  g.add(box(1.22, 0.1, 1.35, color(sheet), 0, 0.6, 0.35), box(0.9, 0.16, 0.42, color('#ffffff'), 0, 0.64, -0.68));
  g.add(texturedBox(1.3, 0.9, 0.12, TEX.planks(), 1.2, 0, 0.6, -1.06));
  return g;
}

export function wardrobe(tint = '#a8723f'): Group {
  const g = new Group();
  g.add(texturedBox(1.4, 2.1, 0.6, TEX.planks(), 0.9, 0, 1.05, 0, tint === '#a8723f' ? undefined : tint));
  g.add(box(0.02, 1.9, 0.02, color('#3b2a20'), 0, 1.05, 0.31));
  for (const x of [-0.12, 0.12]) g.add(box(0.05, 0.22, 0.05, color('#f2c94c'), x, 1.1, 0.33));
  return g;
}

export function desk(): Group {
  const g = new Group();
  g.add(texturedBox(1.4, 0.08, 0.7, TEX.planks(), 1.2, 0, 0.75, 0));
  for (const [x, z] of [
    [-0.62, -0.28],
    [0.62, -0.28],
    [-0.62, 0.28],
    [0.62, 0.28],
  ] as const)
    g.add(box(0.08, 0.75, 0.08, color('#6b4223'), x, 0.37, z));
  g.add(
    box(0.5, 0.35, 0.04, color('#2f3a3f'), 0.25, 1.0, -0.2),
    box(0.46, 0.3, 0.02, new MeshBasicMaterial({ color: '#7fb7dc' }), 0.25, 1.0, -0.17),
  );
  g.add(box(0.3, 0.06, 0.22, color('#e04a5a'), -0.35, 0.82, 0.05), box(0.12, 0.2, 0.12, color('#f2c94c'), -0.55, 0.89, -0.2));
  return g;
}

export function chair(tint = '#8a5a36'): Group {
  const g = new Group();
  g.add(box(0.5, 0.07, 0.5, color(tint), 0, 0.45, 0), box(0.5, 0.5, 0.07, color(tint), 0, 0.72, -0.22));
  for (const [x, z] of [
    [-0.2, -0.2],
    [0.2, -0.2],
    [-0.2, 0.2],
    [0.2, 0.2],
  ] as const)
    g.add(box(0.06, 0.45, 0.06, color('#3b2a20'), x, 0.22, z));
  return g;
}

export function sofa(tint = '#5a7fa8'): Group {
  const g = new Group();
  g.add(box(2.2, 0.4, 0.9, color(tint), 0, 0.3, 0), box(2.2, 0.55, 0.22, color(tint), 0, 0.72, -0.36));
  for (const x of [-1.02, 1.02]) g.add(box(0.2, 0.55, 0.9, color(tint), x, 0.45, 0));
  for (const x of [-0.5, 0.5]) g.add(box(0.85, 0.1, 0.62, color('#ffffff'), x, 0.55, 0.08));
  g.add(box(0.35, 0.3, 0.12, color('#f2c94c'), -0.7, 0.75, -0.18));
  return g;
}

export function tv(): Group {
  const g = new Group();
  g.add(texturedBox(1.8, 0.5, 0.5, TEX.planks(), 1.2, 0, 0.25, 0), box(1.3, 0.75, 0.08, color('#1d1a2f'), 0, 0.95, -0.05));
  g.add(
    box(1.2, 0.66, 0.02, new MeshBasicMaterial({ color: '#3d6d99' }), 0, 0.95, -0.005),
    box(0.3, 0.4, 0.3, color('#3b3f45'), 0.65, 0.7, 0),
  );
  return g;
}

export function coffeeTable(): Group {
  const g = new Group();
  g.add(texturedBox(1.1, 0.08, 0.6, TEX.planks(), 1.2, 0, 0.4, 0));
  for (const [x, z] of [
    [-0.45, -0.22],
    [0.45, -0.22],
    [-0.45, 0.22],
    [0.45, 0.22],
  ] as const)
    g.add(box(0.06, 0.4, 0.06, color('#6b4223'), x, 0.2, z));
  const cup = new Mesh(new CylinderGeometry(0.06, 0.05, 0.1, 8), color('#fff7e6'));
  cup.position.set(0.2, 0.49, 0);
  g.add(cup, box(0.3, 0.04, 0.2, color('#e04a5a'), -0.2, 0.46, 0.05));
  return g;
}

export function rug(w: number, d: number, tint = '#c9473d'): Group {
  const g = new Group();
  const mat = new Mesh(new PlaneGeometry(w, d), color(tint));
  mat.rotation.x = -Math.PI / 2;
  mat.position.y = 0.012;
  const inner = new Mesh(new PlaneGeometry(w - 0.3, d - 0.3), color('#f2c94c'));
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.014;
  const core = new Mesh(new PlaneGeometry(w - 0.45, d - 0.45), color(tint));
  core.rotation.x = -Math.PI / 2;
  core.position.y = 0.016;
  g.add(mat, inner, core);
  return g;
}

export function bookshelf(): Group {
  const g = new Group();
  g.add(texturedBox(1.2, 1.8, 0.4, TEX.planks(), 1, 0, 0.9, 0));
  const books = ['#e04a5a', '#3f6e9a', '#f2c94c', '#3f8f4a', '#8e3b46', '#f6f0ff'];
  for (let shelf = 0; shelf < 3; shelf++)
    for (let i = 0; i < 6; i++)
      g.add(box(0.13, 0.42, 0.28, color(books[(i + shelf * 2) % books.length] ?? '#e04a5a'), -0.45 + i * 0.17, 0.35 + shelf * 0.55, 0.08));
  return g;
}

export function kitchen(): Group {
  const g = new Group();
  g.add(box(2.4, 0.85, 0.65, color('#f4f1ea'), 0, 0.43, 0), box(2.5, 0.06, 0.72, color('#7e7a86'), 0, 0.88, 0.02));
  for (const x of [-0.8, -0.2, 0.4, 1]) g.add(box(0.02, 0.6, 0.02, color('#c9c3b6'), x, 0.42, 0.33));
  g.add(box(0.7, 0.08, 0.45, color('#3b3f45'), -0.65, 0.94, 0), box(0.5, 0.06, 0.4, color('#9cc8e8'), 0.6, 0.92, 0));
  for (const x of [-0.82, -0.48]) {
    const burner = new Mesh(new CylinderGeometry(0.1, 0.1, 0.03, 8), color('#1d1a2f'));
    burner.position.set(x, 0.99, 0);
    g.add(burner);
  }
  const pan = new Mesh(new CylinderGeometry(0.17, 0.14, 0.12, 10), color('#5a5e66'));
  pan.position.set(-0.48, 1.06, 0);
  g.add(pan, box(0.08, 0.3, 0.04, color('#c9c3b6'), 0.6, 1.08, -0.2));
  g.add(box(2.4, 0.6, 0.35, color('#e8dcc2'), 0, 1.85, -0.12));
  return g;
}

export function fridge(): Group {
  const g = new Group();
  g.add(box(0.75, 1.8, 0.7, color('#e8eef2'), 0, 0.9, 0), box(0.73, 0.02, 0.02, color('#b9c2c8'), 0, 1.25, 0.36));
  g.add(
    box(0.04, 0.35, 0.04, color('#8a9399'), 0.28, 1.5, 0.37),
    box(0.04, 0.3, 0.04, color('#8a9399'), 0.28, 0.95, 0.37),
    box(0.15, 0.15, 0.02, color('#e04a5a'), -0.15, 1.5, 0.36),
  );
  return g;
}

export function diningTable(): Group {
  const g = new Group();
  g.add(texturedBox(1.6, 0.08, 0.9, TEX.planks(), 1.2, 0, 0.75, 0));
  for (const [x, z] of [
    [-0.7, -0.35],
    [0.7, -0.35],
    [-0.7, 0.35],
    [0.7, 0.35],
  ] as const)
    g.add(box(0.08, 0.75, 0.08, color('#6b4223'), x, 0.37, z));
  for (const x of [-0.45, 0.45])
    for (const side of [-1, 1]) {
      const c = chair('#a8723f');
      c.position.set(x, 0, side * 0.72);
      c.rotation.y = side > 0 ? Math.PI : 0;
      g.add(c);
    }
  const bowl = new Mesh(new CylinderGeometry(0.2, 0.12, 0.12, 10), color('#f4f1ea'));
  bowl.position.set(0, 0.85, 0);
  g.add(bowl, box(0.12, 0.12, 0.12, color('#e04a5a'), 0.05, 0.93, 0), box(0.12, 0.12, 0.12, color('#f2994a'), -0.07, 0.93, 0.05));
  return g;
}

export function vanity(): Group {
  const g = new Group();
  g.add(texturedBox(1.1, 0.75, 0.45, TEX.planks(), 1.2, 0, 0.38, 0, '#f4e3d3'), box(0.7, 0.9, 0.05, color('#f4e3d3'), 0, 1.25, -0.18));
  g.add(box(0.6, 0.8, 0.02, new MeshBasicMaterial({ color: '#cfe3ef' }), 0, 1.25, -0.15));
  for (const [x, c] of [
    [-0.35, '#e04a5a'],
    [-0.2, '#f6c9d3'],
    [0.3, '#f2c94c'],
  ] as const)
    g.add(box(0.08, 0.16, 0.08, color(c), x, 0.84, 0.05));
  return g;
}
