export interface ViewLimits {
  baseHeight: number;
  minHeight: number;
  maxHeight: number;
  maxWidth: number;
}

export interface ViewInput extends ViewLimits {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
}

export interface ViewResult {
  zoom: number;
  pixelScale: number;
  width: number;
  height: number;
}

const positive = (n: number, fallback: number) => (Number.isFinite(n) && n > 0 ? n : fallback);

export function computeView(input: ViewInput): ViewResult {
  const dpr = positive(input.devicePixelRatio, 1);
  const deviceW = positive(input.viewportWidth * dpr, input.baseHeight);
  const deviceH = positive(input.viewportHeight * dpr, input.baseHeight);
  let k = Math.max(1, Math.round(deviceH / input.baseHeight));
  while (k > 1 && deviceH / k < input.minHeight) k--;
  const height = Math.max(1, Math.min(input.maxHeight, Math.floor(deviceH / k)));
  const width = Math.max(1, Math.min(input.maxWidth, Math.floor(deviceW / k)));
  return { zoom: k / dpr, pixelScale: k, width, height };
}
