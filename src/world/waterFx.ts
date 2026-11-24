import { BoxGeometry, DoubleSide, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, RingGeometry } from 'three';
import { WATER_FX } from '../config/world';
import { stepParticles, type Particle } from '../entities/player/wet';

const ring = new RingGeometry(0.2, 0.38, 16);

export class WaterFx {
  readonly object = new Group();
  private particles: Particle[] = [];
  private ripples: { mesh: Mesh; material: MeshBasicMaterial; age: number }[] = [];
  private readonly drops: InstancedMesh;
  private readonly dummy = new Object3D();

  constructor() {
    this.object.name = 'water-fx';
    this.drops = new InstancedMesh(
      new BoxGeometry(WATER_FX.dropSize, WATER_FX.dropSize * 1.4, WATER_FX.dropSize),
      new MeshBasicMaterial({ color: WATER_FX.drop }),
      WATER_FX.maxParticles,
    );
    this.drops.count = 0;
    this.drops.frustumCulled = false;
    this.object.add(this.drops);
  }

  add(list: readonly Particle[]): void {
    this.particles = [...this.particles, ...list].slice(-WATER_FX.maxParticles);
  }

  ripple(x: number, y: number, z: number): void {
    const material = new MeshBasicMaterial({ color: WATER_FX.ripple, transparent: true, depthWrite: false, side: DoubleSide });
    const mesh = new Mesh(ring, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.renderOrder = 2;
    this.object.add(mesh);
    this.ripples.push({ mesh, material, age: 0 });
  }

  update(dt: number): void {
    this.particles = stepParticles(this.particles, dt, WATER_FX.gravity);
    this.particles.forEach((p, i) => {
      this.dummy.position.set(p.x, p.y, p.z);
      this.dummy.updateMatrix();
      this.drops.setMatrixAt(i, this.dummy.matrix);
    });
    this.drops.count = this.particles.length;
    this.drops.instanceMatrix.needsUpdate = true;
    this.ripples = this.ripples.filter((r) => {
      r.age += dt;
      if (r.age >= WATER_FX.rippleLife) {
        r.mesh.removeFromParent();
        r.material.dispose();
        return false;
      }
      r.mesh.scale.setScalar(1 + r.age * WATER_FX.rippleGrow);
      r.material.opacity = 0.8 * (1 - r.age / WATER_FX.rippleLife);
      return true;
    });
  }

  clear(): void {
    this.particles = [];
    this.update(0);
    for (const r of this.ripples) {
      r.mesh.removeFromParent();
      r.material.dispose();
    }
    this.ripples = [];
  }

  counts(): { particles: number; ripples: number } {
    return { particles: this.particles.length, ripples: this.ripples.length };
  }
}
