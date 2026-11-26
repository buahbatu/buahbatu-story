import { Mesh, Points, ShaderMaterial, Vector4, type Material, type Object3D, type WebGLProgramParametersWithUniforms } from 'three';
import { GRAPHICS } from '../config/graphics';

const CHUNK = `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 bbWorld = modelMatrix * mvPosition;
vec2 bbDelta = bbWorld.xz - bbCurve.xy;
float bbAlong = dot( bbDelta, bbCurve.zw );
float bbAcross = bbDelta.x * bbCurve.w - bbDelta.y * bbCurve.z;
bbWorld.y -= bbBend.x * ( bbAlong * bbAlong + bbBend.y * bbAcross * bbAcross );
mvPosition = viewMatrix * bbWorld;
gl_Position = projectionMatrix * mvPosition;
`;

const MARK = 'bbCurve';

export class WorldCurve {
  private readonly uniforms = {
    bbCurve: { value: new Vector4(0, 0, 0, -1) },
    bbBend: { value: new Vector4(0, GRAPHICS.curve.side, 0, 0) },
  };
  private readonly seen = new WeakSet<Material>();
  private mode: number = GRAPHICS.curve.bend[GRAPHICS.curve.default];
  private flat = false;
  private target = this.mode;
  private current = this.mode;

  get bend(): number {
    return this.current;
  }

  setMode(bend: number): void {
    this.mode = bend;
    this.retarget(false);
  }

  setFlat(flat: boolean, immediate = false): void {
    this.flat = flat;
    this.retarget(immediate);
  }

  private retarget(immediate: boolean): void {
    this.target = this.flat ? 0 : this.mode;
    if (immediate) this.current = this.target;
    this.uniforms.bbBend.value.x = this.current;
  }

  focus(x: number, z: number, dirX: number, dirZ: number): void {
    const len = Math.hypot(dirX, dirZ) || 1;
    this.uniforms.bbCurve.value.set(x, z, dirX / len, dirZ / len);
  }

  update(dt: number): void {
    const k = 1 - Math.exp(-GRAPHICS.curve.ease * dt);
    this.current += (this.target - this.current) * k;
    if (Math.abs(this.target - this.current) < 1e-5) this.current = this.target;
    this.uniforms.bbBend.value.x = this.current;
  }

  attach(root: Object3D): void {
    root.traverse((node) => {
      if (!(node instanceof Mesh) && !(node instanceof Points)) return;
      const material = node.material as Material | Material[];
      const list = Array.isArray(material) ? material : [material];
      for (const material of list) this.patch(material);
    });
  }

  private patch(material: Material): void {
    if (this.seen.has(material) || material instanceof ShaderMaterial) return;
    this.seen.add(material);
    const previous = material.onBeforeCompile.bind(material);
    const uniforms = this.uniforms;
    material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer) => {
      previous(shader, renderer);
      if (!shader.vertexShader.includes('#include <project_vertex>')) return;
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = `uniform vec4 ${MARK};\nuniform vec4 bbBend;\n${shader.vertexShader.replace('#include <project_vertex>', CHUNK)}`;
    };
    const key = material.customProgramCacheKey.bind(material);
    material.customProgramCacheKey = () => `${key()}|${MARK}`;
    material.needsUpdate = true;
  }
}

export const worldCurve = new WorldCurve();
