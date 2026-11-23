export interface FontLoader {
  load(font: string): Promise<unknown>;
}

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
