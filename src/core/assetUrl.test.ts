import { describe, expect, it } from 'vitest';
import { ASSET_VERSION, assetUrl, versioned } from './assetUrl';

describe('URL aset berversi', () => {
  it('versi = hash isi folder aset (10 karakter hex)', () => {
    expect(ASSET_VERSION).toMatch(/^[0-9a-f]{10}$/);
  });

  it('menambah ?v= pada path aset', () => {
    expect(assetUrl('maps/buahbatu.tmj', 'abc')).toBe('/assets/maps/buahbatu.tmj?v=abc');
  });

  it('URL hasil resolve relatif tetap diberi versi tanpa merusak path', () => {
    const map = new URL('http://x/assets/maps/a.tmj?v=old');
    expect(versioned(new URL('../tilesets/ground.png', map), 'abc').href).toBe('http://x/assets/tilesets/ground.png?v=abc');
    expect(versioned(map, 'new').search).toBe('?v=new');
  });
});
