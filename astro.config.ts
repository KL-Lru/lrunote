// @ts-check

import { defineConfig, fontProviders } from 'astro/config';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

import { codeBlockTransformer } from './src/shiki/code-block-transformer';
import { inlineTsPlugin } from './src/plugins/inline-ts';
import { remarkInlineSvg } from './src/plugins/inline-svg';
import { remarkD2 } from './src/plugins/d2';

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
    shikiConfig: {
      themes: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha',
      },
      defaultColor: false,
      transformers: [codeBlockTransformer()],
    },
    remarkPlugins: [
      remarkInlineSvg,
      remarkD2,
    ],
    remarkRehype: {
      footnoteLabel: '参考文献',
      footnoteLabelTagName: 'span',
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'BIZ UDPGothic',
      weights: ['400', '700'],
      cssVariable: '--font-udp',
      fallbacks: [],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inconsolata',
      weights: ['400', '700'],
      cssVariable: '--font-console',
      fallbacks: [],
    },
  ],
});
