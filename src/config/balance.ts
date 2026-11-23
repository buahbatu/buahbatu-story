// SEMUA angka balancing game. Desain: docs/02-arsitektur.md §2, AGENTS.md §5
// Ubah angka di sini, jangan di logika sistem.

/** Waktu (docs/11 §1–2). */
export const TIME = {
  /** Hari dimulai jam 06:00 (dalam menit sejak tengah malam). */
  dayStartMinute: 6 * 60,
  daysPerSeason: 28,
} as const;

/** Ekonomi (docs/13). */
export const ECONOMY = {
  /**
   * Uang awal tiap pemain (Rp, integer). Belum ditentukan di docs → sementara 0.
   * Ditetapkan saat balancing ekonomi (P4-01/P4-08).
   */
  startWallet: 0,
} as const;

/** Hubungan antar pemain (docs/16 §3). Meter 0–100. */
export const RELATIONSHIP = {
  startFriendship: 0,
  startRomance: 0,
  meterMax: 100,
} as const;
