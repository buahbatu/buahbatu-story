import preact from '@preact/preset-vite';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const ENGINE_CHUNK_LIMIT_KB = 700;

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

const assetsDir = fileURLToPath(new URL('./public/assets/', import.meta.url));
const assetHash = createHash('sha256');
for (const f of readdirSync(assetsDir, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => join(e.parentPath, e.name))
  .sort())
  assetHash.update(relative(assetsDir, f).split(sep).join('/')).update(readFileSync(f));
const ASSET_VERSION = assetHash.digest('hex').slice(0, 10);

export default defineConfig({
  plugins: [preact()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __ASSET_VERSION__: JSON.stringify(ASSET_VERSION),
    __DEBUG_ALLOWED__: JSON.stringify(process.env.VERCEL_ENV !== 'production'),
  },
  build: {
    target: 'es2022',
    assetsDir: '_app',
    chunkSizeWarningLimit: ENGINE_CHUNK_LIMIT_KB,
    rolldownOptions: {
      output: {
        manualChunks: (id) =>
          id.includes('node_modules/three/examples') ? 'three-addons' : id.includes('node_modules/three') ? 'three' : undefined,
      },
    },
  },
});
