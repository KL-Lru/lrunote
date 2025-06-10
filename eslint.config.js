import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import astro from 'eslint-plugin-astro';
import react from 'eslint-plugin-react';
import markdown from '@eslint/markdown';
import css from '@eslint/css';

import globals from 'globals';
import { defineConfig } from 'eslint/config';

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
      arrowParens: 'always',
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
  }
];

const astroConfig = [
  ...(astro.configs.recommended).map((config) => {
    // fix missing file patterns
    if (config.name === 'astro/recommended') {
      config.files = ['**/*.astro'];
    }

    return config;
  }),
];

const reactConfig = [
  {
    name: 'react',
    // fix missing file patterns
    files: scriptFiles,
    extends: [react.configs.flat.recommended],
    // disable rules that conflict over React 18
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    }
  },
];

export default defineConfig([
  ...commonConfigs,
  ...jsConfig,
  ...tsConfig,
  ...markConfig,
  ...cssConfig,
  ...astroConfig,
  ...reactConfig,
]);
