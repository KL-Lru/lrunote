// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
  integrations: [icon(), mdx()],
  markdown: {
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'img-svg',
          colorScheme: 'forest',
          dark: true,
        },
      ],
    ],
  },
});
