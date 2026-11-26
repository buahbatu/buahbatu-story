import { N8AOPostPass } from 'n8ao';
import { BloomEffect, EffectComposer, EffectPass, KernelSize, RenderPass, TiltShiftEffect, type Pass } from 'postprocessing';
import {
  Color,
  HalfFloatType,
  ShaderMaterial,
  Vector2,
  type Material,
  type Camera,
  type Scene,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import { FX, type FxProfile } from '../config/graphics';
import type { Grade } from '../world/environment';
import { GradeEffect } from './grade';

export interface RenderStats {
  calls: number;
  triangles: number;
}

class CountingRenderPass extends RenderPass {
  readonly stats: RenderStats = { calls: 0, triangles: 0 };

  override render(
    renderer: WebGLRenderer,
    inputBuffer: WebGLRenderTarget | null,
    outputBuffer: WebGLRenderTarget | null,
    deltaTime?: number,
    stencilTest?: boolean,
  ): void {
    super.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
    this.stats.calls = renderer.info.render.calls;
    this.stats.triangles = renderer.info.render.triangles;
  }
}

const EXPLICIT_LOD = ['#undef texture2D', '#define texture2D(s, uv) textureLod(s, uv, 0.0)', ''].join('\n');

function explicitLod(owner: object, seen: WeakSet<Material>): void {
  for (const value of Object.values(owner)) {
    const material: unknown = value instanceof ShaderMaterial ? value : (value as { material?: unknown } | null)?.material;
    if (!(material instanceof ShaderMaterial) || seen.has(material)) continue;
    seen.add(material);
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = EXPLICIT_LOD + shader.fragmentShader;
    };
    material.needsUpdate = true;
  }
}

export class PostPipeline {
  readonly passes: string[] = [];
  private readonly composer: EffectComposer;
  private readonly scenePass: CountingRenderPass;
  private readonly bloom: BloomEffect;
  private readonly grade = new GradeEffect();
  private readonly tilt: TiltShiftEffect | null;
  private readonly ao: N8AOPostPass | null = null;
  private readonly patched = new WeakSet<Material>();

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera, fx: FxProfile) {
    this.composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType, multisampling: fx.multisampling });
    this.scenePass = new CountingRenderPass(scene, camera);
    this.add(this.scenePass, 'scene');
    if (fx.ssao !== 'off') {
      const ao = new N8AOPostPass(scene, camera, 1, 1);
      ao.setQualityMode(fx.ssao === 'half' ? 'Low' : 'Medium');
      ao.configuration.halfRes = fx.ssao === 'half';
      ao.configuration.aoRadius = FX.ssao.radius;
      ao.configuration.distanceFalloff = FX.ssao.falloff;
      ao.configuration.intensity = FX.ssao.intensity;
      ao.configuration.color = new Color(FX.ssao.color);
      ao.configuration.gammaCorrection = false;
      this.ao = ao;
      this.add(ao, 'ssao');
    }
    this.bloom = new BloomEffect({
      luminanceThreshold: FX.bloom.threshold,
      luminanceSmoothing: FX.bloom.smoothing,
      mipmapBlur: true,
      radius: FX.bloom.radius,
      levels: 5,
      intensity: 0,
    });
    this.tilt = fx.tiltShift ? new TiltShiftEffect({ ...FX.tiltShift, kernelSize: KernelSize.SMALL }) : null;
    const effects = this.tilt ? [this.tilt, this.bloom, this.grade] : [this.bloom, this.grade];
    this.add(new EffectPass(camera, ...effects), fx.tiltShift ? 'tiltShift+bloom+grade' : 'bloom+grade');
    const size = renderer.getSize(new Vector2());
    this.composer.setSize(size.x, size.y, false);
  }

  get stats(): RenderStats {
    return this.scenePass.stats;
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height, false);
  }

  render(dt: number, grade: Grade): void {
    this.grade.apply(grade);
    this.bloom.intensity = grade.bloom;
    if (this.tilt) this.tilt.blendMode.opacity.value = grade.tilt;
    if (this.ao) explicitLod(this.ao, this.patched);
    this.composer.render(dt);
  }

  dispose(): void {
    this.composer.dispose();
  }

  private add(pass: Pass, name: string): void {
    this.composer.addPass(pass);
    this.passes.push(name);
  }
}
