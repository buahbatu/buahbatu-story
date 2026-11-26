import { Color, DirectionalLight, Fog, HemisphereLight, type Scene } from 'three';
import { LIGHTING } from '../config/lighting';
import { SHADOW } from '../config/world';
import { lightingAt, sunOffset, withAtmosphere, type LightState } from '../render/lighting/logic';
import { profile } from '../render/look';
import { SkyDome } from '../render/sky';

export interface Grade {
  exposure: number;
  saturation: number;
  contrast: number;
  tint: Color;
  lift: Color;
  vignette: number;
  bloom: number;
  tilt: number;
}

export interface Atmosphere {
  sky?: string;
  fog?: string;
  near: number;
  far: number;
  indoor?: { background: string; fog: string };
}

const SKY_RADIUS = 90;

export class Environment {
  readonly sun: DirectionalLight;
  readonly grade: Grade = {
    exposure: 1,
    saturation: 1,
    contrast: 1,
    tint: new Color(1, 1, 1),
    lift: new Color(0, 0, 0),
    vignette: 0,
    bloom: 0,
    tilt: 1,
  };
  private readonly ambient: HemisphereLight;
  private readonly sky = new SkyDome(SKY_RADIUS);
  private readonly fog: Fog;
  private readonly scene: Scene;
  private offset = sunOffset({ elevation: 60, azimuth: 150 }, LIGHTING.sunDistance);
  private atmosphere: Atmosphere;
  private hourValue: number = LIGHTING.defaultHour;
  private state: LightState;

  constructor(scene: Scene, atmosphere: Atmosphere, shadows = false) {
    this.scene = scene;
    this.atmosphere = atmosphere;
    this.sun = new DirectionalLight(0xffffff, 1);
    if (shadows) {
      this.sun.castShadow = true;
      this.applyProfile();
      this.sun.shadow.bias = SHADOW.bias;
      this.sun.shadow.normalBias = SHADOW.normalBias;
      const cam = this.sun.shadow.camera;
      cam.left = cam.bottom = -SHADOW.extent;
      cam.right = cam.top = SHADOW.extent;
      cam.near = 1;
      cam.far = 60;
    }
    this.ambient = new HemisphereLight(0xffffff, 0x000000, 1);
    this.fog = new Fog(0xffffff, atmosphere.near, atmosphere.far);
    scene.fog = this.fog;
    scene.add(this.ambient, this.sun, this.sun.target, this.sky.mesh);
    this.state = lightingAt(this.hourValue, LIGHTING.keys);
    this.apply();
  }

  applyProfile(): void {
    if (!this.sun.castShadow) return;
    const { shadowMap, shadowRadius } = profile();
    const { shadow } = this.sun;
    if (shadow.mapSize.x !== shadowMap) {
      shadow.map?.dispose();
      shadow.map = null;
      shadow.mapSize.set(shadowMap, shadowMap);
    }
    shadow.radius = shadowRadius;
  }

  get hour(): number {
    return this.hourValue;
  }

  get light(): LightState {
    return this.state;
  }

  setHour(hour: number): void {
    this.hourValue = hour;
    this.apply();
  }

  setAtmosphere(atmosphere: Atmosphere): void {
    this.atmosphere = atmosphere;
    this.apply();
  }

  aim(x: number, y: number, z: number): void {
    this.sun.position.set(x + this.offset.x, y + this.offset.y, z + this.offset.z);
    this.sun.target.position.set(x, y, z);
  }

  dispose(): void {
    this.sky.dispose();
  }

  private apply(): void {
    const { indoor } = this.atmosphere;
    const base = lightingAt(indoor ? LIGHTING.indoorHour : this.hourValue, LIGHTING.keys);
    const light = withAtmosphere(base, this.atmosphere, LIGHTING.areaBlend);
    this.state = light;
    this.offset = sunOffset(light, LIGHTING.sunDistance);
    this.sun.color.setHex(light.sun);
    this.sun.intensity = light.sunIntensity;
    this.ambient.color.setHex(light.ambientSky);
    this.ambient.groundColor.setHex(light.ambientGround);
    this.ambient.intensity = light.ambient;
    this.fog.near = this.atmosphere.near;
    this.fog.far = this.atmosphere.far;
    this.fog.color.set(indoor ? indoor.fog : light.fog);
    this.sky.mesh.visible = !indoor;
    this.scene.background = indoor ? new Color(indoor.background) : new Color(light.fog);
    this.sky.apply(light, this.offset);
    const g = this.grade;
    g.exposure = light.exposure;
    g.saturation = light.saturation;
    g.contrast = light.contrast;
    g.tint.setHex(light.tint);
    g.lift.setHex(light.lift);
    g.vignette = light.vignette;
    g.bloom = light.bloom;
    g.tilt = indoor ? 0 : 1;
    const target = this.sun.target.position;
    this.aim(target.x, target.y, target.z);
  }
}
