import js from '@eslint/js';
import css from '@eslint/css';
import markdown from '@eslint/markdown';

import stylistic from '@stylistic/eslint-plugin';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

import globals from 'globals';
import { defineConfig, type Config } from 'eslint/config';

const scriptFiles = ['**/*.{js,ts,jsx,tsx}'];
const generalIgnores = ['.astro/**', '**/node_modules/**', '**/dist/**'];

const commonConfigs = [
  {
    name: 'globals/browser',
    files: scriptFiles,
    languageOptions: { globals: globals.browser },
  },
  {
    ...stylistic.configs.customize({
      indent: 2,
      quotes: 'single',
      semi: true,
      arrowParens: true,
      braceStyle: '1tbs',
      commaDangle: 'only-multiline',
    }),
    name: 'stylistic/custom',
    // fix missing file patterns
    files: scriptFiles,
    ignores: generalIgnores,
  },
];

const jsConfig = [
  {
    name: 'js',
    files: scriptFiles,
    ignores: generalIgnores,
    plugins: { js },
    extends: ['js/recommended'],
  }
];

const tsConfig = [
  ...ts.configs.recommended.map((config) => ({
    ...config,
    ignores: generalIgnores,
  })),
];

const markConfig = [
  {
    name: 'markdown',
    files: ['**/*.md', '**/*.mdx'],
    plugins: { markdown },
    language: 'markdown/gfm',
    languageOptions: { frontmatter: 'yaml' },
    extends: ['markdown/recommended'],
  },
];

const cssConfig = [
  {
    name: 'css',
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
    rules: {
      'css/no-invalid-properties': ['error', { allowUnknownVariables: true }],
    } as Config['rules'],
  }
];

const astroConfig = [
  ...astro.configs.recommended
];

const configs: Array<Config> = [
  ...commonConfigs,
  ...jsConfig,
  ...tsConfig,
  ...markConfig,
  ...cssConfig,
  ...astroConfig,
];

export default defineConfig(configs);
