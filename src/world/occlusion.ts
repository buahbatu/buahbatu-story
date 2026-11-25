import { Mesh, Raycaster, Vector3, type Camera, type Material, type Object3D } from 'three';
import { OCCLUSION } from '../config/world';

export const fadeStep = (current: number, target: number, dt: number, speed: number): number =>
  current < target ? Math.min(target, current + speed * dt) : Math.max(target, current - speed * dt);

interface Faded {
  meshes: Mesh[];
  originals: (Material | Material[])[];
  clones: Material[];
  opacity: number;
}

function fade(root: Object3D): Faded {
  const meshes: Mesh[] = [];
  const originals: (Material | Material[])[] = [];
  const clones: Material[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const original = node.material as Material | Material[];
    const copy = (m: Material) => {
      const c = m.clone();
      c.transparent = true;
      c.depthWrite = false;
      clones.push(c);
      return c;
    };
    meshes.push(node as Mesh);
    originals.push(original);
    node.material = Array.isArray(original) ? original.map(copy) : copy(original);
  });
  return { meshes, originals, clones, opacity: 1 };
}

function restore(f: Faded): void {
  f.meshes.forEach((mesh, i) => {
    const original = f.originals[i];
    if (original) mesh.material = original;
  });
  for (const c of f.clones) c.dispose();
}

export class OcclusionFader {
  private readonly ray = new Raycaster();
  private readonly faded = new Map<Object3D, Faded>();
  private candidates: Object3D[] = [];
  private roots = new Set<Object3D>();

  setCandidates(props: readonly Object3D[]): void {
    this.clear();
    this.candidates = props.filter((p) => OCCLUSION.fade.some((model) => p.name === `prop:${model}`));
    this.roots = new Set(this.candidates);
  }

  clear(): void {
    for (const f of this.faded.values()) restore(f);
    this.faded.clear();
  }

  occluding(): string[] {
    return [...this.faded.keys()].map((r) => r.name).sort();
  }

  update(camera: Camera, targets: readonly Vector3[], dt: number | null): void {
    const hits = new Set<Object3D>();
    const origin = camera.getWorldPosition(new Vector3());
    for (const target of targets) {
      const dir = target.clone().sub(origin);
      const far = dir.length() - OCCLUSION.margin;
      if (far <= 0) continue;
      this.ray.set(origin, dir.normalize());
      this.ray.far = far;
      for (const hit of this.ray.intersectObjects(this.candidates, true)) {
        let node: Object3D | null = hit.object;
        while (node && !this.roots.has(node)) node = node.parent;
        if (node) hits.add(node);
      }
    }
    for (const root of hits) if (!this.faded.has(root)) this.faded.set(root, fade(root));
    for (const [root, f] of this.faded) {
      const target = hits.has(root) ? OCCLUSION.opacity : 1;
      f.opacity = dt === null ? target : fadeStep(f.opacity, target, dt, OCCLUSION.speed);
      if (f.opacity >= 1) {
        restore(f);
        this.faded.delete(root);
        continue;
      }
      for (const c of f.clones) c.opacity = f.opacity;
    }
  }
}
