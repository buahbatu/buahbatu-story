import {
  AnimationMixer,
  Color,
  Box3,
  CanvasTexture,
  ImageLoader,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  SRGBColorSpace,
  Vector3,
  type AnimationAction,
  type Object3D,
  type Texture,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CHARACTER, WATER_FX } from '../../config/world';
import type { Appearance, PaletteCell } from './appearance';
import type { PlayerAnim } from './logic';

const BASE = `${import.meta.env.BASE_URL}assets/models/characters/`;
const CELL_W = 32;
const CELL_H = 128;
const CLIP: Record<PlayerAnim, string> = { idle: 'idle', walk: 'walk', run: 'sprint' };

const models = new Map<string, Promise<GLTF>>();
let palette: Promise<HTMLImageElement> | null = null;

export const loadModel = (name: string): Promise<GLTF> => {
  let p = models.get(name);
  if (!p) {
    p = new GLTFLoader().loadAsync(`${BASE}${name}.glb`);
    models.set(name, p);
  }
  return p;
};

const loadPalette = () => (palette ??= new ImageLoader().loadAsync(`${BASE}Textures/colormap.png`));

function recolor(image: HTMLImageElement, colors: Appearance['colors']): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (!g) throw new Error('canvas 2d tidak tersedia');
  g.drawImage(image, 0, 0);
  for (const [cell, hex] of Object.entries(colors) as [PaletteCell, string][]) {
    const [, c, r] = /c(\d+)r(\d+)/.exec(cell) ?? [];
    const x = Number(c) * CELL_W;
    const y = Number(r) * CELL_H;
    const img = g.getImageData(x, y, CELL_W, CELL_H);
    const d = img.data;
    const lum = (i: number) => 0.3 * (d[i] ?? 0) + 0.59 * (d[i + 1] ?? 0) + 0.11 * (d[i + 2] ?? 0);
    let total = 0;
    for (let i = 0; i < d.length; i += 4) total += lum(i);
    const avg = total / (d.length / 4) || 1;
    const n = Number.parseInt(hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    for (let i = 0; i < d.length; i += 4) {
      const k = lum(i) / avg;
      for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.min(255, Math.round((rgb[ch] ?? 0) * k));
    }
    g.putImageData(img, x, y);
  }
  const texture = new CanvasTexture(canvas);
  texture.flipY = false;
  texture.magFilter = texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export interface Character {
  root: Object3D;
  play(anim: PlayerAnim, time: number): void;
  setWet(amount: number): void;
}

export async function createCharacter(look: Appearance): Promise<Character> {
  const [gltf, image] = await Promise.all([loadModel(look.model), loadPalette()]);
  const root = clone(gltf.scene);
  const map = recolor(image, look.colors);
  const materials: MeshLambertMaterial[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.castShadow = true;
    const material = new MeshLambertMaterial({ map });
    materials.push(material);
    node.material = material;
  });
  const height = new Box3().setFromObject(root).getSize(new Vector3()).y || 1;
  root.scale.setScalar(CHARACTER.height / height);
  const mixer = new AnimationMixer(root);
  const actions = new Map<PlayerAnim, AnimationAction>();
  for (const anim of Object.keys(CLIP) as PlayerAnim[]) {
    const clip = gltf.animations.find((a) => a.name === CLIP[anim]);
    if (clip) actions.set(anim, mixer.clipAction(clip));
  }
  let current: AnimationAction | null = null;
  const dry = new Color('#ffffff');
  const wet = new Color(WATER_FX.wetTint);
  return {
    root,
    setWet(amount) {
      for (const m of materials) m.color.copy(dry).lerp(wet, amount * WATER_FX.wetAmount);
    },
    play(anim, time) {
      const action = actions.get(anim) ?? null;
      if (action !== current) {
        current?.stop();
        action?.play();
        current = action;
      }
      if (action) {
        action.time = time % action.getClip().duration;
        mixer.update(0);
      }
    },
  };
}
