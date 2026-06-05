/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import type { ViteUserConfig } from 'astro';

export default getViteConfig({
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.direnv/**',
    ],
  },
} as ViteUserConfig);
