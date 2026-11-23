import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// Phaser ±1,4 MB (±360 KB gzip). Dipisah jadi chunk sendiri supaya cache browser awet antar deploy.
const PHASER_CHUNK_LIMIT_KB = 1500;

export default defineConfig({
  plugins: [preact()],
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
