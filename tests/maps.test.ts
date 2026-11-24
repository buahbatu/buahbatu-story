import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AREA_IDS, PROP_MODELS } from '../src/config/world';
import { isI18nKey } from '../src/content/i18n';
import { PLAYER } from '../src/config/balance';
import { bodyBlocked, parseArea, walkLevel, type AreaData } from '../src/world/map/logic';
import { DEFAULT_BUILDING } from '../src/world/props/buildings';
import { TEXT_PROPS } from '../src/world/props/registry';

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
    it('properti bangunan dikenal kit (tanpa salah ketik)', () => {
      const known = new Set(['model', 'rotation', ...Object.keys(DEFAULT_BUILDING)]);
      const keys = objects.filter((o) => o.kind === 'prop' && o.props.model === 'building').flatMap((o) => Object.keys(o.props));
      expect(keys.filter((k) => !known.has(k))).toEqual([]);
    });
  });
});
