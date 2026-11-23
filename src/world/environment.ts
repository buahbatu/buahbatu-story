import { Color, DirectionalLight, Fog, HemisphereLight, type Scene } from 'three';
import { PALETTE } from '../config/palette';

export function addEnvironment(scene: Scene, fog: { near: number; far: number }): void {
  scene.background = new Color(PALETTE.sky);
  scene.fog = new Fog(PALETTE.fog, fog.near, fog.far);
  const sun = new DirectionalLight(PALETTE.sun, 1.4);
  sun.position.set(10, 20, 8);
  scene.add(new HemisphereLight(PALETTE.sun, PALETTE.grassDark, 1.6), sun);
}
