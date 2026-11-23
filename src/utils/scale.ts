// Hitung zoom canvas supaya 1 pixel game = tepat N pixel FISIK layar (pixel art tetap tajam).
// Desain: docs/40-ui-ux.md §1 & §7 (scaling integer, 640×360 → ×2/×3)
//
// Zoom dihitung dalam pixel perangkat, bukan CSS px: di laptop dengan display scaling 125%
// (devicePixelRatio 1.25), zoom CSS ×2 = 2,5 pixel fisik per pixel game → blur. Di sini hasilnya
// misalnya ×3 fisik = zoom CSS 2,4.

export interface ScaleInput {
  /** Ukuran area tersedia dalam CSS px. */
  viewportWidth: number;
  viewportHeight: number;
  /** window.devicePixelRatio (≥ 0). Nilai tidak valid dianggap 1. */
  devicePixelRatio: number;
  baseWidth: number;
  baseHeight: number;
}

export interface ScaleResult {
  /** Faktor zoom untuk Phaser (`scale.setZoom`), dalam CSS px. */
  zoom: number;
  /** Pixel fisik per pixel game. Bilangan bulat, kecuali `integer` = false. */
  devicePixelsPerGamePixel: number;
  /** False kalau layar lebih kecil dari resolusi dasar sehingga terpaksa diperkecil pecahan. */
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
  if (whole >= 1) {
    return { zoom: whole / dpr, devicePixelsPerGamePixel: whole, integer: true };
  }
  // Layar sangat kecil (mis. HP lama 568×320): diperkecil pecahan daripada terpotong.
  return { zoom: safeFit / dpr, devicePixelsPerGamePixel: safeFit, integer: false };
}
