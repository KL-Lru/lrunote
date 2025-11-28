import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define articles collection
const articlesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/articles' }),
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    permalink: z
      .string()
      .min(1, 'Permalink is required')
  }),
});

export const collections = {
  articles: articlesCollection,
};
