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
import { WATER, WORLD_SKIRT } from '../config/world';
import { elevation, isBlocked, type AreaData } from './map/logic';
import { buildTerrain, buildWater, scatterTufts, tileHash } from './map/terrain';
import { preloadAssets } from './props/assets';
import { assetsFor } from './props/logic';
import { PROP_FACTORIES, isPropModel } from './props/registry';
import { TEX, repeated } from './props/textures';
import { roadMesh } from './road/mesh';

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
  const data = buildWater(area);
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

export function skirt(area: Pick<AreaData, 'width' | 'height'>, margin = WORLD_SKIRT): Group {
  const g = new Group();
  g.name = 'skirt';
  const { width: W, height: H } = area;
  for (const [x0, z0, w, d] of [
    [-margin, -margin, W + margin * 2, margin],
    [-margin, H, W + margin * 2, margin],
    [-margin, 0, margin, H],
    [W, 0, margin, H],
  ] as const) {
    const plane = new Mesh(new PlaneGeometry(w, d), new MeshLambertMaterial({ map: repeated(TEX.grass(), w, d) }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x0 + w / 2, 0, z0 + d / 2);
    g.add(plane);
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
