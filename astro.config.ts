// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    icon(),
    starlight({
      title: 'Lru Note',
      components: {
        Header: './src/components/overrides/Headers.astro',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/kl-lru/lrunote',
        },
      ],
      sidebar: [],
    }),
  ],
});
