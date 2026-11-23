// Konstanta UI overlay & font. Desain: docs/40-ui-ux.md §1 & §9, docs/42-aset-lisensi.md
export const FONT = {
  /** Teks & dialog: mudah dibaca. */
  body: 'Pixelify Sans',
  /** Judul: pakai hemat, ukuran kelipatan 8px. */
  title: 'Press Start 2P',
} as const;

/** Font yang dipastikan termuat sebelum Title tampil (format `document.fonts.load`). */
export const FONTS_TO_PRELOAD = [
  `400 16px "${FONT.body}"`,
  `700 16px "${FONT.body}"`,
  `16px "${FONT.title}"`,
];

/** Kalau font gagal dimuat (offline, dsb.), lanjut pakai font cadangan setelah selang ini. */
export const FONT_LOAD_TIMEOUT_MS = 3000;

export const TOAST = {
  /** Maksimal notifikasi bertumpuk (docs/40 §9). */
  maxVisible: 3,
  durationMs: 3500,
} as const;
