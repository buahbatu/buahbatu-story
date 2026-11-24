import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', '..', 'public', 'assets', 'maps');
const areas = readdirSync(dir)
  .filter((f) => f.endsWith('.tmj'))
  .map((f) => f.slice(0, -'.tmj'.length))
  .sort();
writeFileSync(join(dir, 'index.json'), JSON.stringify({ areas }, null, 1) + '\n');
console.log(`index.json ${areas.length} area`);
