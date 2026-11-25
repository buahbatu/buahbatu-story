import { Group } from 'three';
import { BRIDGE, WATER_DEPTH } from '../../config/world';
import type { Bridge } from '../map/logic';
import { box, color, textured } from '../props/kit';
import { TEX } from '../props/textures';

const { colors: C, rail: RAIL, thickness: T } = BRIDGE;

function wood(length: number, width: number, deck: number): Group {
  const g = new Group();
  const n = Math.max(2, Math.round(length / 0.32));
  const step = length / n;
  for (let i = 0; i < n; i++)
    g.add(
      box(
        step * 0.9,
        T,
        width,
        i % 3 === 1 ? color(C.woodDark) : textured(TEX.planks(), 0.3, width),
        -length / 2 + step * (i + 0.5),
        deck - T / 2,
        0,
      ),
    );
  const side = width / 2 - BRIDGE.railInset;
  for (const z of [-side, side]) {
    g.add(box(length, 0.12, 0.1, color(C.woodDark), 0, deck - T - 0.06, z * 0.8));
    g.add(
      box(length + 0.1, 0.08, 0.09, color(C.wood), 0, deck + RAIL, z),
      box(length, 0.06, 0.06, color(C.woodDark), 0, deck + RAIL * 0.5, z),
    );
    const posts = Math.max(2, Math.round(length / BRIDGE.postEvery) + 1);
    for (let i = 0; i < posts; i++) {
      const x = -length / 2 + (length * i) / (posts - 1);
      g.add(box(0.13, RAIL + 0.08, 0.13, color(C.woodDark), x, deck + RAIL / 2, z));
      const leg = deck + WATER_DEPTH;
      if (i > 0 && i < posts - 1) g.add(box(0.15, leg, 0.15, color(C.woodDark), x, deck - leg / 2 - T, z * 0.8));
    }
  }
  return g;
}

function concrete(length: number, width: number, deck: number): Group {
  const g = new Group();
  g.add(box(length + 0.1, T * 1.6, width, textured(TEX.plasterWhite(), length, width, C.concrete), 0, deck - T * 0.8, 0));
  g.add(box(length, 0.05, width - 0.5, color('#6d6a66'), 0, deck + 0.005, 0));
  const side = width / 2 - 0.08;
  for (const z of [-side, side]) {
    g.add(box(length, 0.42, 0.16, textured(TEX.plasterWhite(), length, 0.42, C.concrete), 0, deck + 0.21, z));
    g.add(box(length + 0.06, 0.06, 0.22, color(C.concreteDark), 0, deck + 0.44, z));
    for (const x of [-length / 2, length / 2]) g.add(box(0.24, 0.6, 0.24, textured(TEX.curb(), 1, 1), x, deck + 0.3, z));
  }
  const leg = deck + WATER_DEPTH;
  for (const x of [-length / 4, length / 4]) g.add(box(0.5, leg, width * 0.7, color(C.concreteDark), x, deck - T * 1.6 - leg / 2 + 0.1, 0));
  return g;
}

export function bridgeMesh(b: Bridge): Group {
  const [length, width] = b.along === 'x' ? [b.w, b.h] : [b.h, b.w];
  const g = b.style === 'concrete' ? concrete(length, width, b.deck) : wood(length, width, b.deck);
  g.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
  if (b.along === 'y') g.rotation.y = Math.PI / 2;
  g.name = `bridge:${b.style}`;
  g.traverse((n) => {
    n.castShadow = true;
    n.receiveShadow = true;
  });
  return g;
}
