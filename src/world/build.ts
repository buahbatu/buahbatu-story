import {
  BufferGeometry,
  Float32BufferAttribute,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  MeshLambertMaterial,
  PlaneGeometry,
  type Material,
  type Texture,
} from 'three';
import { WATER, WATER_DEPTH, WORLD_SKIRT } from '../config/world';
import { edgeWalls, skirtLayout } from './water/logic';
import { bridgesOf, elevation, isBlocked, type AreaData } from './map/logic';
import { buildTerrain, buildWater, scatterTufts, tileHash } from './map/terrain';
import { preloadAssets } from './props/assets';
import { assetsFor } from './props/logic';
import { PROP_FACTORIES, isPropModel } from './props/registry';
import { TEX, repeated } from './props/textures';
import { roadMesh } from './road/mesh';
import { bridgeMesh } from './water/bridge';

export function terrainMesh(area: AreaData, atlas: Texture): Mesh {
  const data = buildTerrain(area);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(data.uvs, 2));
  geometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
  geometry.setIndex(data.indices);
  geometry.computeBoundingSphere();
  const mesh = new Mesh(geometry, new MeshLambertMaterial({ map: atlas, vertexColors: true }));
  mesh.name = 'terrain';
  mesh.receiveShadow = true;
  return mesh;
}

export function waterMesh(area: AreaData): Mesh | null {
  const data = buildWater(area, area.settings.interior === true ? 0 : WORLD_SKIRT);
  if (data.indices.length === 0) return null;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(data.uvs, 2));
  geometry.setIndex(data.indices);
  geometry.computeVertexNormals();
  const map = repeated(TEX.ripple(), 0.5, 0.5);
  const mesh = new Mesh(
    geometry,
    new MeshLambertMaterial({ color: WATER.color, map, transparent: true, opacity: WATER.opacity, depthWrite: false }),
  );
  mesh.name = 'water';
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;
  return mesh;
}

export function tuftMesh(area: AreaData): InstancedMesh | null {
  const tufts = scatterTufts(area, (x, y) => isBlocked(area, x, y));
  if (tufts.length === 0) return null;
  const blade = new PlaneGeometry(0.55, 0.55);
  blade.translate(0, 0.27, 0);
  const mesh = new InstancedMesh(blade, new MeshLambertMaterial({ map: TEX.tuft(), alphaTest: 0.5, side: DoubleSide }), tufts.length * 2);
  const dummy = new Object3D();
  tufts.forEach((t, i) => {
    for (let k = 0; k < 2; k++) {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.turn + (k * Math.PI) / 2, 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i * 2 + k, dummy.matrix);
    }
  });
  mesh.name = 'tufts';
  mesh.receiveShadow = true;
  return mesh;
}

export function skirt(area: Pick<AreaData, 'width' | 'height' | 'terrain' | 'heights'>, margin = WORLD_SKIRT): Group {
  const g = new Group();
  g.name = 'skirt';
  const { grass, beds } = skirtLayout(area, margin);
  const flat = (r: { x: number; z: number; w: number; d: number }, y: number, map: Texture) => {
    const plane = new Mesh(new PlaneGeometry(r.w, r.d), new MeshLambertMaterial({ map: repeated(map, r.w, r.d) }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(r.x + r.w / 2, y, r.z + r.d / 2);
    return plane;
  };
  for (const r of grass) g.add(flat(r, 0, TEX.grass()));
  for (const w of edgeWalls(area)) {
    const length = w.to - w.from;
    const wall = new Mesh(
      new PlaneGeometry(length, w.height),
      new MeshLambertMaterial({ map: repeated(TEX.rock(), length, w.height), side: DoubleSide }),
    );
    const mid = (w.from + w.to) / 2;
    if (w.side === 'n' || w.side === 's') wall.position.set(mid, w.height / 2, w.side === 'n' ? 0 : area.height);
    else {
      wall.rotation.y = Math.PI / 2;
      wall.position.set(w.side === 'w' ? 0 : area.width, w.height / 2, mid);
    }
    g.add(wall);
  }
  for (const b of beds) {
    const bed = flat(b, -WATER_DEPTH, TEX.soil());
    bed.material = new MeshLambertMaterial({ color: WATER.bed });
    g.add(bed);
    const alongX = b.w > b.d;
    for (const side of [0, 1]) {
      const length = alongX ? b.w : b.d;
      const wall = new Mesh(
        new PlaneGeometry(length, WATER_DEPTH),
        new MeshLambertMaterial({ map: repeated(TEX.soil(), length, WATER_DEPTH), side: DoubleSide }),
      );
      if (alongX) wall.position.set(b.x + b.w / 2, -WATER_DEPTH / 2, b.z + side * b.d);
      else {
        wall.rotation.y = Math.PI / 2;
        wall.position.set(b.x + side * b.w, -WATER_DEPTH / 2, b.z + b.d / 2);
      }
      g.add(wall);
    }
  }
  return g;
}

export const preloadArea = (area: AreaData): Promise<void> =>
  preloadAssets(assetsFor(area.objects.filter((o) => o.kind === 'prop').map((o) => o.props.model)));

export function buildArea(area: AreaData, atlas: Texture): Group {
  const root = new Group();
  root.name = `area:${area.id}`;
  root.add(terrainMesh(area, atlas));
  const outdoor = area.settings.interior !== true;
  if (outdoor) {
    const s = skirt(area);
    s.traverse((n) => {
      n.receiveShadow = true;
    });
    root.add(s);
    const tufts = tuftMesh(area);
    if (tufts) root.add(tufts);
  }
  const water = waterMesh(area);
  if (water) root.add(water);
  for (const o of area.objects) if (o.kind === 'road') root.add(roadMesh(area, o));
  for (const b of bridgesOf(area)) root.add(bridgeMesh(b));
  for (const o of area.objects) {
    if (o.kind !== 'prop' || !isPropModel(o.props.model)) continue;
    const x = o.x + o.w / 2;
    const z = o.y + o.h / 2;
    const prop = PROP_FACTORIES[o.props.model](o.props, tileHash(Math.round(x * 4), Math.round(z * 4), 7));
    prop.position.set(x, elevation(area, x, z), z);
    prop.rotation.y = (-Number(o.props.rotation ?? 0) * Math.PI) / 180;
    prop.name = `prop:${o.props.model}`;
    prop.traverse((n) => {
      n.castShadow = true;
      n.receiveShadow = true;
    });
    root.add(prop);
  }
  return root;
}

export function disposeTree(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh) || node.userData.shared === true) return;
    (node.geometry as BufferGeometry).dispose();
    const materials: Material[] = Array.isArray(node.material) ? (node.material as Material[]) : [node.material as Material];
    for (const m of materials) m.dispose();
  });
  root.removeFromParent();
}
