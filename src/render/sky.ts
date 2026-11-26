import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry, Vector3, type Camera } from 'three';
import type { LightState } from './lighting/logic';

const VERTEX = `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const FRAGMENT = `
uniform vec3 top;
uniform vec3 horizon;
uniform vec3 below;
uniform vec3 sunColor;
uniform vec3 sunDir;
uniform float glow;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 c = h >= 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.85, h), 0.7)) : mix(horizon, below, smoothstep(0.0, -0.25, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  c += sunColor * (pow(s, 180.0) * 1.6 + pow(s, 10.0) * 0.22) * glow;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class SkyDome {
  readonly mesh: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly uniforms = {
    top: { value: new Color() },
    horizon: { value: new Color() },
    below: { value: new Color() },
    sunColor: { value: new Color() },
    sunDir: { value: new Vector3(0, 1, 0) },
    glow: { value: 1 },
  };

  constructor(radius: number) {
    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: BackSide,
      depthWrite: false,
      fog: false,
    });
    this.mesh = new Mesh(new SphereGeometry(radius, 32, 16), material);
    this.mesh.name = 'sky';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1;
    this.mesh.userData.dynamic = true;
    this.mesh.onBeforeRender = (_r, _s, camera: Camera) => {
      this.mesh.position.setFromMatrixPosition(camera.matrixWorld);
      this.mesh.updateMatrixWorld();
    };
  }

  apply(light: LightState, sun: { x: number; y: number; z: number }): void {
    const u = this.uniforms;
    u.top.value.setHex(light.skyTop);
    u.horizon.value.setHex(light.skyHorizon);
    u.below.value.setHex(light.fog);
    u.sunColor.value.setHex(light.sun);
    u.sunDir.value.set(sun.x, sun.y, sun.z);
    u.glow.value = 0.35 + light.day * 0.65;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
