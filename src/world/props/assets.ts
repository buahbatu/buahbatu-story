import {
  Box3,
  BufferAttribute,
  Color,
  Group,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  NearestFilter,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ASSET_LOOK } from '../../config/world';
import { assetUrl } from '../../core/assetUrl';
import { fitScale, projectUVs } from './logic';
import { TEX } from './textures';

const pending = new Map<string, Promise<void>>();
const loaded = new Map<string, Object3D>();
const materials = new Map<string, MeshLambertMaterial>();
export type Tint = Readonly<Record<string, string>>;

export function preloadAssets(files: readonly string[]): Promise<void> {
  return Promise.all(
    files.map((file) => {
      let p = pending.get(file);
      if (!p) {
        p = new GLTFLoader().loadAsync(assetUrl(`models/${file}.glb`)).then((gltf) => {
          loaded.set(file, prepare(gltf.scene));
        });
        pending.set(file, p);
      }
      return p;
    }),
  ).then(() => undefined);
}

function prepare(scene: Object3D): Object3D {
  scene.traverse((node) => {
    if (!(node instanceof Mesh) || Array.isArray(node.material)) return;
    const name = (node.material as Material).name;
    const geometry = node.geometry as BufferGeometry;
    const { position, normal } = geometry.attributes as Record<string, BufferAttribute | undefined>;
    if (!ASSET_LOOK.textures[name] || !position || !normal) return;
    geometry.setAttribute('uv', new BufferAttribute(projectUVs(position.array, normal.array, ASSET_LOOK.uvDensity), 2));
  });
  return scene;
}

function lambert(source: Material, tint: Tint): MeshLambertMaterial {
  const override = tint[source.name];
  const look = override ? undefined : ASSET_LOOK.textures[source.name];
  const hex = override ?? look?.tint ?? ASSET_LOOK.colors[source.name];
  const key = `${source.uuid}|${hex ?? ''}`;
  const cached = materials.get(key);
  if (cached) return cached;
  const base = source instanceof MeshStandardMaterial ? source : null;
  const map = look ? TEX[look.texture]() : (base?.map ?? null);
  if (map) {
    map.magFilter = map.minFilter = NearestFilter;
    map.generateMipmaps = false;
    map.needsUpdate = true;
  }
  const created = new MeshLambertMaterial({
    color: hex ? new Color(hex) : (base?.color.clone() ?? new Color('#ffffff')),
    map,
    flatShading: true,
  });
  created.userData.shared = true;
  materials.set(key, created);
  return created;
}

export function asset(file: string, tint: Tint = {}): Group {
  const source = loaded.get(file);
  if (!source) throw new Error(`aset ${file} belum dimuat`);
  const model = source.clone(true);
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.material = Array.isArray(node.material)
      ? node.material.map((m: Material) => lambert(m, tint))
      : lambert(node.material as Material, tint);
    node.userData.shared = true;
  });
  const box = new Box3().setFromObject(model);
  const center = box.getCenter(new Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  const holder = new Group();
  holder.add(model);
  holder.name = `asset:${file}`;
  return holder;
}

export const sizeOf = (object: Object3D): Vector3 => new Box3().setFromObject(object).getSize(new Vector3());

export function fit(object: Object3D, target: number, axis: 'y' | 'xz' = 'y'): Object3D {
  const size = sizeOf(object);
  object.scale.multiplyScalar(fitScale(axis === 'y' ? size.y : Math.max(size.x, size.z), target));
  return object;
}
