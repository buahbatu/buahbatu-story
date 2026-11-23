// Hitung isi loading bar. Murni supaya bisa dites tanpa Phaser.
// Desain: docs/02-arsitektur.md §6 (PreloadScene: loading bar)

export interface BarFill {
  /** Lebar isi bar dalam pixel game (bilangan bulat, supaya tepi bar tetap tajam). */
  fillWidth: number;
  /** Persen bulat 0–100 untuk teks. */
  percent: number;
}

export function loadingBarFill(progress: number, innerWidth: number): BarFill {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return { fillWidth: Math.floor(p * innerWidth), percent: Math.floor(p * 100) };
}
