import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  type Material,
  type Object3D,
  type Texture,
} from 'three';
import { WORLD_SKIRT } from '../config/world';
import { elevation, type AreaData } from './map/logic';
import { buildTerrain } from './map/terrain';
import { PROP_FACTORIES, isPropModel } from './props/registry';
import { TEX, repeated } from './props/textures';

export function terrainMesh(area: AreaData, atlas: Texture): Mesh {
  const data = buildTerrain(area);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(data.uvs, 2));
  geometry.setIndex(data.indices);
  geometry.computeBoundingSphere();
  const mesh = new Mesh(geometry, new MeshLambertMaterial({ map: atlas }));
  mesh.name = 'terrain';
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

export function buildArea(area: AreaData, atlas: Texture): Group {
  const root = new Group();
  root.name = `area:${area.id}`;
  root.add(terrainMesh(area, atlas));
  if (area.settings.interior !== true) root.add(skirt(area));
  for (const o of area.objects) {
    if (o.kind !== 'prop' || !isPropModel(o.props.model)) continue;
    const prop = PROP_FACTORIES[o.props.model](o.props);
    const x = o.x + o.w / 2;
    const z = o.y + o.h / 2;
    prop.position.set(x, elevation(area, x, z), z);
    prop.rotation.y = (-Number(o.props.rotation ?? 0) * Math.PI) / 180;
    prop.name = `prop:${o.props.model}`;
    root.add(prop);
  }
  return root;
}

export function disposeTree(root: Object3D): void {
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    (node.geometry as BufferGeometry).dispose();
    const materials: Material[] = Array.isArray(node.material) ? (node.material as Material[]) : [node.material as Material];
    for (const m of materials) m.dispose();
  });
  root.removeFromParent();
}
