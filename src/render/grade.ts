import { Effect } from 'postprocessing';
import { Color, Uniform } from 'three';
import type { Grade } from '../world/environment';

const FRAGMENT = `
uniform float exposure;
uniform float saturation;
uniform float contrast;
uniform vec3 tint;
uniform vec3 lift;
uniform float vignette;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = inputColor.rgb * exposure * tint;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, saturation);
  c = max(c, 0.0);
  vec3 lc = log2(c + 1e-4);
  c = exp2((lc - log2(0.18)) * contrast + log2(0.18)) - 1e-4;
  c += lift * (1.0 - smoothstep(0.0, 0.35, l));
  float d = length((uv - 0.5) * vec2(1.15, 1.0));
  c *= 1.0 - vignette * smoothstep(0.35, 0.9, d);
  outputColor = vec4(max(c, 0.0), inputColor.a);
}`;

export class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', FRAGMENT, {
      uniforms: new Map<string, Uniform>([
        ['exposure', new Uniform(1)],
        ['saturation', new Uniform(1)],
        ['contrast', new Uniform(1)],
        ['tint', new Uniform(new Color(1, 1, 1))],
        ['lift', new Uniform(new Color(0, 0, 0))],
        ['vignette', new Uniform(0)],
      ]),
    });
  }

  apply(grade: Grade): void {
    const u = this.uniforms;
    const set = (name: string, value: number) => {
      const uniform = u.get(name);
      if (uniform) uniform.value = value;
    };
    set('exposure', grade.exposure);
    set('saturation', grade.saturation);
    set('contrast', grade.contrast);
    set('vignette', grade.vignette);
    (u.get('tint')?.value as Color | undefined)?.copy(grade.tint);
    (u.get('lift')?.value as Color | undefined)?.copy(grade.lift);
  }
}
