import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PROP_MODELS } from '../src/config/world';
import { doorTargets, parseArea } from '../src/world/map/logic';

const dir = join(import.meta.dirname, '..', 'public', 'assets', 'maps');
const files = readdirSync(dir).filter((f) => f.endsWith('.tmj'));
const areas = new Set(files.map((f) => f.replace(/\.tmj$/, '')));

describe('peta di public/assets/maps (docs/10 §6)', () => {
  it('minimal ada peta sandbox', () => {
    expect(areas.has('sandbox')).toBe(true);
  });
  describe.each(files)('%s', (file) => {
    const id = file.replace(/\.tmj$/, '');
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { tilesets?: { image?: string }[] };
    const { area, issues } = parseArea(id, raw);
    it('lolos skema & konvensi', () => {
      expect(issues).toEqual([]);
    });
    it('gambar tileset ada', () => {
      for (const set of raw.tilesets ?? []) expect(existsSync(resolve(dir, set.image ?? '')), set.image).toBe(true);
    });
    it('pintu & tepi peta menuju area yang ada', () => {
      expect(doorTargets(area ?? ({ objects: [] } as never)).filter((t) => !areas.has(t))).toEqual([]);
    });
    it('prop memakai model yang dikenal', () => {
      const unknown = (area?.objects ?? []).filter(
        (o) => o.kind === 'prop' && !(PROP_MODELS as readonly unknown[]).includes(o.props.model),
      );
      expect(unknown.map((o) => o.props.model)).toEqual([]);
    });
  });
});
