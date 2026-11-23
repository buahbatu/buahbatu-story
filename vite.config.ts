import { readFileSync } from 'node:fs';

import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// Phaser ±1,4 MB (±360 KB gzip). Dipisah jadi chunk sendiri supaya cache browser awet antar deploy.
const PHASER_CHUNK_LIMIT_KB = 1500;

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
    chunkSizeWarningLimit: PHASER_CHUNK_LIMIT_KB,
    rolldownOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
  },
});
