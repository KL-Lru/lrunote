import { defineCollection, z } from 'astro:content';

// Define articles collection
const articlesCollection = defineCollection({
  type: 'content',
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
