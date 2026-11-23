// Desain: docs/03-standar-kode.md §5, docs/50-testing-deploy.md §1
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
  }),
);
