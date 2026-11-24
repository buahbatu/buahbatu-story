import { readFileSync } from 'node:fs';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

const ENGINE_CHUNK_LIMIT_KB = 700;

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  plugins: [preact()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
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
