import { ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial } from 'three';
import { box, color, signPanel, textured, texturedBox } from './kit';
import { TEX, awning, signTexture } from './textures';

export function haystack(): Group {
  const g = new Group();
  const hay = new Mesh(new CylinderGeometry(0.7, 0.85, 1.1, 10), textured(TEX.bamboo(), 3, 1, '#f2d27a'));
  hay.position.y = 0.55;
  const top = new Mesh(new ConeGeometry(0.75, 0.6, 10), color('#e3be5c'));
  top.position.y = 1.4;
  g.add(hay, top);
  return g;
}

export function bench(): Group {
  const g = new Group();
  g.add(texturedBox(1.6, 0.1, 0.45, TEX.planks(), 1.5, 0, 0.45, 0), texturedBox(1.6, 0.35, 0.08, TEX.planks(), 1.5, 0, 0.75, -0.2));
  for (const x of [-0.65, 0.65]) g.add(box(0.1, 0.45, 0.4, color('#3b3f45'), x, 0.22, 0));
  return g;
}

export function powerPole(): Group {
  const g = new Group();
  const pole = new Mesh(new CylinderGeometry(0.09, 0.12, 5, 6), color('#9aa0a6'));
  pole.position.y = 2.5;
  g.add(pole, box(1.4, 0.1, 0.1, color('#6b7075'), 0, 4.6, 0));
  for (const x of [-0.6, 0, 0.6]) g.add(box(0.08, 0.14, 0.08, color('#e8e2d0'), x, 4.72, 0));
  g.add(new Mesh(new CylinderGeometry(0.22, 0.22, 0.5, 8), color('#5c6166')).translateY(3.9).translateX(0.25));
  return g;
}

export function foodCart(tint = '#d9534a', label = ''): Group {
  const g = new Group();
  g.add(
    texturedBox(1.6, 0.8, 0.8, TEX.planks(), 1.5, 0, 0.75, 0, tint === '#d9534a' ? undefined : tint),
    box(1.7, 0.08, 0.9, color('#f3ead6'), 0, 1.18, 0),
  );
  for (const x of [-0.5, 0.5]) {
    const wheel = new Mesh(new CylinderGeometry(0.3, 0.3, 0.08, 10), color('#3b3f45'));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.3, 0.44);
    g.add(wheel);
  }
  for (const x of [-0.75, 0.75]) g.add(box(0.06, 1, 0.06, color('#d9d3c6'), x, 1.7, -0.35));
  const roof = box(1.9, 0.08, 1.1, new MeshLambertMaterial({ map: awning(tint, '#fff7e6') }), 0, 2.22, 0);
  roof.rotation.x = 0.15;
  g.add(roof, box(0.35, 0.3, 0.35, color('#c9c9c9'), -0.45, 1.36, 0), box(0.5, 0.12, 0.35, color('#f2c94c'), 0.35, 1.28, 0));
  if (label) {
    const tex = signTexture(label, tint, '#fff7e6');
    const canvas = tex.image as HTMLCanvasElement;
    const w = Math.min(1.55, (canvas.width / canvas.height) * 0.4);
    g.add(box(w, w / (canvas.width / canvas.height), 0.04, new MeshBasicMaterial({ map: tex }), 0, 0.85, 0.42));
  }
  return g;
}

export function signBoard(text: string, background = '#2f5d50'): Group {
  const g = new Group();
  const tex = signTexture(text, background, '#fff7e6');
  const canvas = tex.image as HTMLCanvasElement;
  const h = 0.55;
  const w = (canvas.width / canvas.height) * h;
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) g.add(box(0.1, 1.4, 0.1, color('#6b4223'), x, 0.7, 0));
  g.add(signPanel(tex, w, h, 0, 1.35, 0.1));
  return g;
}
