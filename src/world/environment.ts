import { Color, DirectionalLight, Fog, HemisphereLight, type Scene } from 'three';
import { PALETTE } from '../config/palette';
import { SHADOW } from '../config/world';
import { profile } from '../render/look';

const SUN_OFFSET = { x: 10, y: 20, z: 8 } as const;

export function addEnvironment(scene: Scene, fog: { near: number; far: number }, shadows = false): DirectionalLight {
  scene.background = new Color(PALETTE.sky);
  scene.fog = new Fog(PALETTE.fog, fog.near, fog.far);
  const sun = new DirectionalLight(PALETTE.sun, shadows ? 1.9 : 1.4);
  sun.position.set(SUN_OFFSET.x, SUN_OFFSET.y, SUN_OFFSET.z);
  if (shadows) {
    sun.castShadow = true;
    const size = profile().shadowMap;
    sun.shadow.mapSize.set(size, size);
    sun.shadow.bias = SHADOW.bias;
    const cam = sun.shadow.camera;
    cam.left = cam.bottom = -SHADOW.extent;
    cam.right = cam.top = SHADOW.extent;
    cam.near = 1;
    cam.far = 60;
  }
  scene.add(new HemisphereLight(PALETTE.sun, PALETTE.grassDark, shadows ? 1.25 : 1.6), sun, sun.target);
  return sun;
}

export function aimSun(sun: DirectionalLight, x: number, y: number, z: number): void {
  sun.position.set(x + SUN_OFFSET.x, y + SUN_OFFSET.y, z + SUN_OFFSET.z);
  sun.target.position.set(x, y, z);
}
