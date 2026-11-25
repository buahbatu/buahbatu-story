export interface ViewResult {
  zoom: number;
  pixelScale: number;
  width: number;
  height: number;
  ratio: number;
}

export interface SmoothInput {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  maxDpr: number;
  maxAspect: number;
  scale: number;
}

const positive = (n: number, fallback: number) => (Number.isFinite(n) && n > 0 ? n : fallback);

export function computeSmoothView(input: SmoothInput): ViewResult {
  const dpr = positive(input.devicePixelRatio, 1);
  const height = Math.max(1, Math.floor(positive(input.viewportHeight, 1)));
  const width = Math.max(1, Math.floor(Math.min(positive(input.viewportWidth, 1), height * input.maxAspect)));
  const ratio = Math.round(Math.min(dpr, input.maxDpr) * Math.min(1, Math.max(0.1, input.scale)) * 100) / 100;
  return { zoom: 1, pixelScale: ratio, width, height, ratio };
}
