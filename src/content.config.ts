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
    sections: z.array(z.object({
      title: z.string().min(1, 'Section title is required'),
      items: z.array(z.string().min(1, 'Item cannot be empty string')),
    })).optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
  layers: layersCollection,
};
