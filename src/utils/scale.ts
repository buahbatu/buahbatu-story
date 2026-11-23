export const MIN_INTEGER_FILL = 0.8;

export const FRACTIONAL_MIN_DPR = 2;

export interface ScaleInput {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  baseWidth: number;
  baseHeight: number;
  minIntegerFill?: number;
}

export interface ScaleResult {
  zoom: number;
  devicePixelsPerGamePixel: number;
  integer: boolean;
}

export function computeScale(input: ScaleInput): ScaleResult {
  const dpr = Number.isFinite(input.devicePixelRatio) && input.devicePixelRatio > 0 ? input.devicePixelRatio : 1;
  const fit = Math.min((input.viewportWidth * dpr) / input.baseWidth, (input.viewportHeight * dpr) / input.baseHeight);
  const safeFit = Number.isFinite(fit) && fit > 0 ? fit : 1;
  const whole = Math.floor(safeFit);
  const minFill = dpr >= FRACTIONAL_MIN_DPR ? (input.minIntegerFill ?? MIN_INTEGER_FILL) : 0;
  if (whole >= 1 && whole / safeFit >= minFill) {
    return { zoom: whole / dpr, devicePixelsPerGamePixel: whole, integer: true };
  }
  const device = Math.floor(safeFit * input.baseWidth) / input.baseWidth;
  return { zoom: device / dpr, devicePixelsPerGamePixel: device, integer: false };
}
