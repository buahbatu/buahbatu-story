import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AREA_IDS, HILL, PROP_MODELS } from '../src/config/world';
import { isI18nKey } from '../src/content/i18n';
import { PLAYER } from '../src/config/balance';
import { bodyBlocked, cornerHill, parseArea, tileIndex, walkLevel, type AreaData } from '../src/world/map/logic';
import { DEFAULT_BUILDING } from '../src/world/props/buildings';
import { TEXT_PROPS } from '../src/world/props/registry';
import { waterfallOf } from '../src/world/water/logic';

const dir = join(import.meta.dirname, '..', 'public', 'assets', 'maps');
const files = readdirSync(dir).filter((f) => f.endsWith('.tmj'));
const idOf = (file: string) => file.slice(0, -'.tmj'.length);
const raw = new Map(files.map((f) => [idOf(f), JSON.parse(readFileSync(join(dir, f), 'utf8')) as { tilesets?: { image?: string }[] }]));
const parsed = new Map<string, ReturnType<typeof parseArea>>([...raw].map(([id, json]) => [id, parseArea(id, json)]));
const planned = new Set<string>(AREA_IDS);

describe('peta di public/assets/maps (docs/10 §6)', () => {
  it('index.json mendaftar semua peta yang ada (dipakai transisi area)', () => {
    const manifest = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as { areas: string[] };
    expect(manifest.areas).toEqual([...raw.keys()].sort());
  });
  it('minimal ada peta sandbox & setiap peta terdaftar di AREA_IDS', () => {
    expect(raw.has('sandbox')).toBe(true);
    expect([...raw.keys()].filter((id) => !planned.has(id))).toEqual([]);
  });
  describe.each([...raw.keys()])('%s', (id) => {
    const { area, issues } = parsed.get(id) ?? { area: null, issues: ['tidak terbaca'] };
    const objects = area?.objects ?? [];
    it('lolos skema & konvensi', () => {
      expect(issues).toEqual([]);
    });
    it('gambar tileset ada', () => {
      for (const set of raw.get(id)?.tilesets ?? []) expect(existsSync(resolve(dir, set.image ?? '')), set.image).toBe(true);
    });
    it('pintu & tepi menuju area terdaftar; kalau petanya sudah ada, spawn tujuannya wajib ada', () => {
      const exits = objects.filter((o) => o.kind === 'door' || o.kind === 'edge');
      expect(exits.map((o) => String(o.props.targetArea)).filter((t) => !planned.has(t))).toEqual([]);
      const spawnsOf = (target: string): AreaData['spawns'] | undefined => parsed.get(target)?.area?.spawns;
      const broken = exits.filter((o) => {
        const spawns = spawnsOf(String(o.props.targetArea));
        return spawns !== undefined && !(String(o.props.targetSpawn) in spawns);
      });
      expect(broken.map((o) => `${String(o.props.targetArea)}/${String(o.props.targetSpawn)}`)).toEqual([]);
    });
    it('prop memakai model yang dikenal & teks papan nama memakai kunci i18n yang ada', () => {
      const props = objects.filter((o) => o.kind === 'prop');
      expect(props.map((o) => o.props.model).filter((m) => !(PROP_MODELS as readonly unknown[]).includes(m))).toEqual([]);
      const texts = props.flatMap((o) => TEXT_PROPS.map((k) => o.props[k]).filter((v) => v !== undefined));
      expect(texts.filter((v) => !isI18nKey(v))).toEqual([]);
    });
    it('setiap spawn berada di tempat bebas (pemain tidak muncul terjebak)', () => {
      if (!area) return;
      const stuck = Object.entries(area.spawns).filter(([, p]) => bodyBlocked(area, p.x, p.y, walkLevel(area, p.x, p.y), PLAYER));
      expect(stuck.map(([k]) => k)).toEqual([]);
    });
    it('kontur: ladang, air, bangunan & tepi peta tetap datar; lereng tidak terlalu curam', () => {
      if (!area) return;
      const h = (x: number, y: number) => cornerHill(area, x, y);
      const spread = (x0: number, y0: number, x1: number, y1: number) => {
        const v: number[] = [];
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) v.push(h(x, y));
        return Math.max(...v) - Math.min(...v);
      };
      const bad: string[] = [];
      for (let y = 0; y < area.height; y++)
        for (let x = 0; x < area.width; x++) {
          const i = tileIndex(area, x, y);
          if (area.farmable[i] && spread(x, y, x + 1, y + 1) > HILL.flatTolerance) bad.push(`ladang ${x},${y}`);
          if (
            area.terrain[i] === 'water' &&
            Math.max(...[h(x, y), h(x + 1, y), h(x, y + 1), h(x + 1, y + 1)].map(Math.abs)) > HILL.flatTolerance
          )
            bad.push(`air ${x},${y}`);
        }
      for (let x = 0; x <= area.width; x++)
        for (const y of [0, area.height]) if (Math.abs(h(x, y)) > HILL.flatTolerance) bad.push(`tepi ${x},${y}`);
      for (let y = 0; y <= area.height; y++)
        for (const x of [0, area.width]) if (Math.abs(h(x, y)) > HILL.flatTolerance) bad.push(`tepi ${x},${y}`);
      for (const c of area.collisions.filter((r) => r.w >= HILL.solidMin && r.h >= HILL.solidMin))
        if (spread(Math.floor(c.x), Math.floor(c.y), Math.ceil(c.x + c.w), Math.ceil(c.y + c.h)) > HILL.flatTolerance)
          bad.push(`bangunan ${c.x},${c.y}`);
      for (let y = 0; y <= area.height; y++)
        for (let x = 0; x < area.width; x++) if (Math.abs(h(x + 1, y) - h(x, y)) > HILL.maxGrade) bad.push(`curam ${x},${y}`);
      for (let y = 0; y < area.height; y++)
        for (let x = 0; x <= area.width; x++) if (Math.abs(h(x, y + 1) - h(x, y)) > HILL.maxGrade) bad.push(`curam ${x},${y}`);
      expect(bad).toEqual([]);
    });
    it('air terjun sah: ada air di atas & di bawah tebing, dan air jatuh ke bawah', () => {
      if (!area) return;
      const falls = objects.filter((o) => o.kind === 'waterfall');
      expect(falls.filter((o) => waterfallOf(area, o) === null).map((o) => `${String(o.x)},${String(o.y)}`)).toEqual([]);
    });
    it('properti bangunan dikenal kit (tanpa salah ketik)', () => {
      const known = new Set(['model', 'rotation', ...Object.keys(DEFAULT_BUILDING)]);
      const keys = objects.filter((o) => o.kind === 'prop' && o.props.model === 'building').flatMap((o) => Object.keys(o.props));
      expect(keys.filter((k) => !known.has(k))).toEqual([]);
    });
  });
});
