// Tunggu font web siap (supaya teks Phaser tidak tergambar dengan font cadangan), dengan batas waktu.
// Desain: docs/40-ui-ux.md §1

export interface FontLoader {
  load(font: string): Promise<unknown>;
}

/** Selesai saat semua font termuat ATAU batas waktu habis; tidak pernah reject (game tetap jalan). */
export async function waitForFonts(
  loader: FontLoader | undefined,
  fonts: readonly string[],
  timeoutMs: number,
  setTimer: (callback: () => void, ms: number) => unknown = setTimeout,
): Promise<'loaded' | 'timeout' | 'failed'> {
  if (!loader) return 'failed';
  const all = Promise.all(fonts.map((font) => loader.load(font))).then(
    () => 'loaded' as const,
    () => 'failed' as const,
  );
  const timeout = new Promise<'timeout'>((resolve) => {
    setTimer(() => {
      resolve('timeout');
    }, timeoutMs);
  });
  return Promise.race([all, timeout]);
}
