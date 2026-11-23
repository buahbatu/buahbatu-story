export const FONT = {
  body: 'Pixelify Sans',
  title: 'Press Start 2P',
} as const;

export const FONTS_TO_PRELOAD = [`400 16px "${FONT.body}"`, `700 16px "${FONT.body}"`, `16px "${FONT.title}"`];

export const FONT_LOAD_TIMEOUT_MS = 3000;

export const TOAST = {
  maxVisible: 3,
  durationMs: 3500,
} as const;
