export const SPRITE_COLORS = {
  R: '#d9465b',
  r: '#a8323f',
  Y: '#f6d867',
  L: '#4f8f4a',
  l: '#7fc46a',
  W: '#fff7e6',
  P: '#f2a0b8',
  O: '#f2994a',
  B: '#6fa8dc',
  b: '#3f6e9a',
  K: '#3b2a20',
} as const;

export type SpriteColor = keyof typeof SPRITE_COLORS;

export const SPRITES = {
  berry: ['...lLl...', '..lLLLl..', '.RRlLlRR.', 'RRYRRRYRR', 'RRRRRYRRR', 'RYRRRRRRr', '.RRRYRRr.', '..RRRRr..', '...RRr...', '....r....'],
  leaf: ['.....ll', '...llLl', '..lLLl.', '.lLLl..', 'lLLl...', 'Ll.....'],
  flower: ['.P.P.', 'PPYPP', '.PPP.', '..L..', '.LL..'],
  daisy: ['.W.W.', 'WWOWW', '.WWW.', '..L..', '..LL.'],
  butterfly: ['B.....B', 'BB...BB', 'BbBKBbB', '.BBKBB.', '.Bb.bB.', '..B.B..'],
  sparkle: ['..W..', '..W..', 'WWWWW', '..W..', '..W..'],
} as const satisfies Record<string, readonly string[]>;

export type SpriteName = keyof typeof SPRITES;

export interface SpriteRect {
  x: number;
  y: number;
  w: number;
  color: string;
}

export function spriteRects(rows: readonly string[]): SpriteRect[] {
  const out: SpriteRect[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row.charAt(x);
      let w = 1;
      while (row.charAt(x + w) === c) w++;
      if (c in SPRITE_COLORS) out.push({ x, y, w, color: SPRITE_COLORS[c as SpriteColor] });
      x += w;
    }
  });
  return out;
}
