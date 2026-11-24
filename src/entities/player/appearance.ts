export type PaletteCell = `c${number}r${number}`;

export interface Appearance {
  model: string;
  colors: Partial<Record<PaletteCell, string>>;
}

export const APPEARANCE: Record<'A' | 'B', Appearance> = {
  A: { model: 'character-male-a', colors: { c3r2: '#e0a878', c9r2: '#4a86c8', c7r3: '#2b2220', c1r3: '#7a4a2a' } },
  B: {
    model: 'character-female-f',
    colors: { c1r2: '#4a2c22', c3r2: '#4a2c22', c5r2: '#f3caa9', c4r2: '#f3caa9', c1r3: '#bcd3e8', c5r1: '#8eaccb', c7r3: '#232327' },
  },
};
