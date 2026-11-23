// Hitung zoom canvas supaya pixel art tetap tajam DAN memakai layar sebaik mungkin.
// Desain: docs/40-ui-ux.md §1 & §7, ADR-018
//
// 1. Zoom dihitung dalam pixel perangkat, bukan CSS px: di laptop dengan display scaling 125%
//    (devicePixelRatio 1.25), zoom CSS ×2 = 2,5 pixel fisik per pixel game → blur. Di sini hasilnya
//    misalnya ×3 fisik = zoom CSS 2,4.
// 2. Di layar berkerapatan tinggi (DPR ≥ 2: HP, Retina), integer hanya dipakai kalau mengisi
//    ≥ `minIntegerFill` ruang. Kalau tidak (mis. iPhone landscape 734×343: integer ×2 dari kemungkinan
//    ×2,86 = 70%), pakai skala pecahan yang memenuhi layar. Canvas tetap `image-rendering: pixelated`
//    (nearest-neighbor): piksel tetap kotak tegas, sebagian baris/kolom 1 piksel fisik lebih tebal —
//    tidak terlihat di layar sepadat itu.
// 3. Di layar DPR < 2 (desktop/laptop), selalu integer: di sana piksel fisik besar sehingga ukuran
//    piksel game yang selang-seling (mis. 2 & 3 px) terlihat jelas, terutama saat kamera bergerak.

/** Batas default: integer harus mengisi ≥ 80% ruang (linear), kalau tidak pakai pecahan. */
export const MIN_INTEGER_FILL = 0.8;
/** DPR minimal agar skala pecahan diizinkan (ketidakrataan 1 piksel fisik tak terlihat). */
export const FRACTIONAL_MIN_DPR = 2;

export interface ScaleInput {
  /** Ukuran area tersedia dalam CSS px. */
  viewportWidth: number;
  viewportHeight: number;
  /** window.devicePixelRatio (≥ 0). Nilai tidak valid dianggap 1. */
  devicePixelRatio: number;
  baseWidth: number;
  baseHeight: number;
  /** 0–1, hanya berlaku di DPR ≥ FRACTIONAL_MIN_DPR. Default MIN_INTEGER_FILL. */
  minIntegerFill?: number;
}

export interface ScaleResult {
  /** Faktor zoom untuk Phaser (`scale.setZoom`), dalam CSS px. */
  zoom: number;
  /** Pixel fisik per pixel game. Bilangan bulat kalau `integer`. */
  devicePixelsPerGamePixel: number;
  /** False kalau memakai skala pecahan (layar pendek/kecil). */
  integer: boolean;
}

export function computeScale(input: ScaleInput): ScaleResult {
  const dpr =
    Number.isFinite(input.devicePixelRatio) && input.devicePixelRatio > 0 ? input.devicePixelRatio : 1;
  const fit = Math.min(
    (input.viewportWidth * dpr) / input.baseWidth,
    (input.viewportHeight * dpr) / input.baseHeight,
  );
  const safeFit = Number.isFinite(fit) && fit > 0 ? fit : 1;
  const whole = Math.floor(safeFit);
  const minFill = dpr >= FRACTIONAL_MIN_DPR ? (input.minIntegerFill ?? MIN_INTEGER_FILL) : 0;
  if (whole >= 1 && whole / safeFit >= minFill) {
    return { zoom: whole / dpr, devicePixelsPerGamePixel: whole, integer: true };
  }
  // Pecahan: dibulatkan ke bawah per pixel fisik lebar canvas supaya tepinya jatuh di pixel penuh.
  const device = Math.floor(safeFit * input.baseWidth) / input.baseWidth;
  return { zoom: device / dpr, devicePixelsPerGamePixel: device, integer: false };
}
