import {
  CircleGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  RingGeometry,
  type Texture,
} from 'three';
import { WATERFALL } from '../../config/world';
import type { AreaData } from '../map/logic';
import { TEX, repeated } from '../props/textures';
import { foamPuffs, ringPhase, waterfallsOf, type Waterfall } from './logic';

interface Live {
  maps: Texture[];
  puffs: Mesh[];
  rings: { mesh: Mesh; material: MeshBasicMaterial }[];
  foam: Texture;
}

const puffGeometry = new IcosahedronGeometry(WATERFALL.puffSize, 0);
const ringGeometry = new RingGeometry(0.55, 0.7, 20);

function curtain(w: Waterfall, width: number, live: Live): Group {
  const g = new Group();
  const height = w.top - w.bottom;
  const fallMap = repeated(TEX.fall(), width, height);
  const lipMap = repeated(TEX.fall(), width, WATERFALL.lip);
  live.maps.push(fallMap, lipMap);
  const material = (map: Texture) =>
    new MeshLambertMaterial({
      map,
      color: WATERFALL.colors.curtain,
      transparent: true,
      opacity: WATERFALL.opacity,
      side: DoubleSide,
      depthWrite: false,
    });
  const fall = new Mesh(new PlaneGeometry(width, height), material(fallMap));
  fall.position.set(0, w.bottom + height / 2, WATERFALL.out + WATERFALL.lip * 0.35);
  const lip = new Mesh(new PlaneGeometry(width, WATERFALL.lip), material(lipMap));
  lip.rotation.x = -Math.PI / 3.2;
  lip.position.set(0, w.top - 0.02, WATERFALL.lip * 0.15);
  fall.renderOrder = lip.renderOrder = 3;
  g.add(fall, lip);
  return g;
}

function base(w: Waterfall, width: number, live: Live): Group {
  const g = new Group();
  const y = w.bottom + 0.02;
  const foam = repeated(TEX.foam(), width, WATERFALL.foamRadius * 2);
  live.foam = foam;
  const sheet = new Mesh(
    new PlaneGeometry(width + 0.4, WATERFALL.foamRadius * 1.6),
    new MeshBasicMaterial({ map: foam, transparent: true, opacity: 0.85, depthWrite: false }),
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set(0, y, WATERFALL.foamRadius * 0.7);
  sheet.renderOrder = 2;
  const mist = new Mesh(
    new CircleGeometry(WATERFALL.foamRadius * 1.1, 16),
    new MeshBasicMaterial({ color: WATERFALL.colors.mist, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  mist.position.set(0, y + 0.35, WATERFALL.foamRadius * 0.4);
  mist.renderOrder = 4;
  g.add(sheet, mist);
  const puffMaterial = new MeshLambertMaterial({ color: WATERFALL.colors.foam, flatShading: true });
  for (let i = 0; i < WATERFALL.puffs; i++) {
    const p = new Mesh(puffGeometry, puffMaterial);
    p.position.y = y;
    live.puffs.push(p);
    g.add(p);
  }
  for (let i = 0; i < WATERFALL.rings; i++) {
    const material = new MeshBasicMaterial({ color: WATERFALL.colors.foam, transparent: true, depthWrite: false, side: DoubleSide });
    const mesh = new Mesh(ringGeometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, y + 0.01, WATERFALL.foamRadius * 0.6);
    mesh.renderOrder = 2;
    live.rings.push({ mesh, material });
    g.add(mesh);
  }
  return g;
}

export class WaterfallView {
  readonly object = new Group();
  private live: Live[] = [];

  build(area: AreaData): void {
    this.object.clear();
    this.live = [];
    this.object.name = 'waterfalls';
    for (const w of waterfallsOf(area)) {
      const width = Math.hypot(w.to.x - w.from.x, w.to.z - w.from.z);
      const live: Live = { maps: [], puffs: [], rings: [], foam: TEX.foam() };
      const g = new Group();
      g.name = 'waterfall';
      g.add(curtain(w, width, live), base(w, width, live));
      g.position.set((w.from.x + w.to.x) / 2, 0, (w.from.z + w.to.z) / 2);
      g.rotation.y = Math.atan2(w.normal.x, w.normal.z);
      this.object.add(g);
      this.live.push(live);
    }
    this.update(0);
  }

  count(): number {
    return this.live.length;
  }

  update(time: number): void {
    for (const l of this.live) {
      for (const m of l.maps) m.offset.y = time * WATERFALL.flow;
      l.foam.offset.set(Math.sin(time * 0.7) * 0.1, -time * 0.25);
      foamPuffs(l.puffs.length, time, WATERFALL.foamRadius).forEach((p, i) => {
        const mesh = l.puffs[i];
        if (!mesh) return;
        mesh.position.x = p.x;
        mesh.position.z = p.z * 0.9 + 0.15;
        mesh.scale.setScalar(p.s);
      });
      l.rings.forEach((r, i) => {
        const k = ringPhase(i, l.rings.length, time, WATERFALL.ringLife);
        r.mesh.scale.setScalar(0.6 + k * 1.4);
        r.material.opacity = 0.7 * (1 - k);
      });
    }
  }
}
