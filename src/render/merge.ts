import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  SkinnedMesh,
  type Material,
  type Object3D,
  type Texture,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Piece {
  geometry: BufferGeometry;
  material: Material;
  cast: boolean;
  receive: boolean;
}

type Mapped = Material & { map?: Texture | null; color?: { getHexString(): string }; flatShading?: boolean; vertexColors: boolean };

const canonical = new Map<string, Material>();
const plainMaps = new Map<string, Texture>();

const bakeable = (map: Texture | null | undefined): map is Texture => !!map && map.rotation === 0;

function keyOf(m: Mapped): string {
  const map = m.map;
  if (map && !bakeable(map)) return `uuid:${m.uuid}`;
  return [
    m.type,
    m.color ? m.color.getHexString() : '',
    map ? `${map.source.uuid}:${String(map.wrapS)}:${String(map.wrapT)}:${String(map.magFilter)}:${String(map.minFilter)}` : '-',
    String(m.transparent),
    String(m.opacity),
    String(m.side),
    String(m.flatShading ?? false),
    String(m.vertexColors),
    String(m.alphaTest),
    String(m.depthWrite),
    String(m.blending),
  ].join('|');
}

function plainMap(map: Texture): Texture {
  const key = `${map.source.uuid}:${String(map.wrapS)}:${String(map.wrapT)}:${String(map.magFilter)}:${String(map.minFilter)}`;
  let plain = plainMaps.get(key);
  if (!plain) {
    plain = map.clone();
    plain.repeat.set(1, 1);
    plain.offset.set(0, 0);
    plain.needsUpdate = true;
    plainMaps.set(key, plain);
  }
  return plain;
}

function shared(m: Mapped): Material {
  const key = keyOf(m);
  if (key.startsWith('uuid:')) return m;
  let c = canonical.get(key);
  if (!c) {
    c = m.clone();
    const map = (c as Mapped).map;
    if (map) (c as Mapped).map = plainMap(map);
    c.userData.shared = true;
    canonical.set(key, c);
  }
  return c;
}

function slice(geometry: BufferGeometry, start: number, count: number): BufferGeometry {
  const out = new BufferGeometry();
  for (const [name, attr] of Object.entries(geometry.attributes)) {
    const a = attr as BufferAttribute;
    out.setAttribute(name, new BufferAttribute(a.array.slice(start * a.itemSize, (start + count) * a.itemSize), a.itemSize, a.normalized));
  }
  return out;
}

function bakeUv(geometry: BufferGeometry, map: Texture | null | undefined): void {
  const uv = geometry.getAttribute('uv') as BufferAttribute | undefined;
  if (!uv || !bakeable(map)) return;
  const { x: rx, y: ry } = map.repeat;
  const { x: ox, y: oy } = map.offset;
  if (rx === 1 && ry === 1 && ox === 0 && oy === 0) return;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * rx + ox, uv.getY(i) * ry + oy);
}

function pieces(mesh: Mesh, relative: Matrix4): Piece[] {
  const base = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  base.applyMatrix4(relative);
  const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Mapped[];
  const total = (base.getAttribute('position') as BufferAttribute).count;
  const groups = Array.isArray(mesh.material) && base.groups.length > 0 ? base.groups : [{ start: 0, count: total, materialIndex: 0 }];
  const out: Piece[] = [];
  for (const g of groups) {
    const source = materials[g.materialIndex ?? 0];
    if (!source || g.count <= 0) continue;
    const geometry = groups.length === 1 ? base : slice(base, g.start, g.count);
    bakeUv(geometry, source.map);
    out.push({ geometry, material: shared(source), cast: mesh.castShadow, receive: mesh.receiveShadow });
  }
  return out;
}

const mergeable = (node: Object3D): node is Mesh =>
  node instanceof Mesh &&
  !(node instanceof SkinnedMesh) &&
  !(node instanceof InstancedMesh) &&
  node.userData.dynamic !== true &&
  !node.morphTargetInfluences;

export function mergeStatic(root: Object3D): number {
  root.updateMatrixWorld(true);
  const inverse = new Matrix4().copy(root.matrixWorld).invert();
  const meshes: Mesh[] = [];
  root.traverse((n) => {
    if (n !== root && mergeable(n)) meshes.push(n);
  });
  if (meshes.length < 2) return meshes.length;
  const buckets = new Map<string, { material: Material; cast: boolean; receive: boolean; geometries: BufferGeometry[] }>();
  for (const mesh of meshes) {
    const relative = new Matrix4().multiplyMatrices(inverse, mesh.matrixWorld);
    for (const p of pieces(mesh, relative)) {
      const attrs = Object.keys(p.geometry.attributes).sort().join(',');
      const key = `${p.material.uuid}|${attrs}|${String(p.cast)}|${String(p.receive)}`;
      let b = buckets.get(key);
      if (!b) {
        b = { material: p.material, cast: p.cast, receive: p.receive, geometries: [] };
        buckets.set(key, b);
      }
      b.geometries.push(p.geometry);
    }
  }
  for (const mesh of meshes) {
    mesh.removeFromParent();
    if (mesh.userData.shared !== true) mesh.geometry.dispose();
  }
  let count = 0;
  for (const b of buckets.values()) {
    const geometry = b.geometries.length === 1 ? b.geometries[0] : mergeGeometries(b.geometries, false);
    if (!geometry) continue;
    if (b.geometries.length > 1) for (const g of b.geometries) g.dispose();
    geometry.computeBoundingSphere();
    const merged = new Mesh(geometry, b.material);
    merged.name = 'merged';
    merged.castShadow = b.cast;
    merged.receiveShadow = b.receive;
    root.add(merged);
    count++;
  }
  return count;
}
