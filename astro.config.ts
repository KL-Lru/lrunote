// @ts-check
import { type Plugin } from 'vite';
import { buildSync } from 'esbuild';

import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import rehypeMermaid from 'rehype-mermaid';

function inlineTsPlugin(): Plugin {
  return {
    name: 'inline-bundle',
    transform(_, id) {
      if (id.endsWith('?inline-bundle')) {
        const filePath = id.replace('?inline-bundle', '');

        const result = buildSync({
          entryPoints: [filePath],
          bundle: true,
          write: false,
          minify: true,
        });
        const bundledCode = result.outputFiles[0].text;

        return { code: `export default ${JSON.stringify(bundledCode)}`, map: null };
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [inlineTsPlugin()],
  },
  integrations: [icon(), mdx(), pagefind()],
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
