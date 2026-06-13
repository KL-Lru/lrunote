import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define articles collection
const articlesCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/articles',
    generateId: ({ entry }) => '/' + entry.replace(/\.(mdx?|md)$/, '')
  }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    permalink: z.string().min(1, 'Permalink is required')
  }),
});

const layersCollection = defineCollection({
  loader: glob({
    pattern: '**/.layer.toml',
    base: './src/articles',
    generateId: ({ entry }) => '/' + entry.replace(/\/?\.layer\.toml$/, '')
  }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    // 階層の簡易的な説明（レイヤー画面の説明文に使用）
    description: z.string().optional(),
    // 直下の子（.layer.toml を持つディレクトリ名 / 記事ファイル名）の表示順
    order: z.array(z.string().min(1, 'Order entry cannot be empty string')).optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  layers: layersCollection,
};
