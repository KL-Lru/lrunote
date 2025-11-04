import { defineCollection, z } from 'astro:content';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load tag hierarchy from tag.schema.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tagSchemaPath = join(__dirname, 'tag.schema.json');
const tagSchema = JSON.parse(readFileSync(tagSchemaPath, 'utf-8'));

// Extract all valid tag paths from the tag structure
function extractTagPaths(
  obj: Record<string, unknown>,
  prefix = '',
): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    // Skip $label field
    if (key === '$label') {
      continue;
    }

    const currentPath = prefix ? `${prefix}/${key}` : key;

    // Add current path
    paths.push(currentPath);

    // Process object recursively
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      paths.push(...extractTagPaths(value as Record<string, unknown>, currentPath));
    }
  }

  return paths;
}

// Generate set of valid tag paths
const validTags = new Set(extractTagPaths(tagSchema));

// Define articles collection
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1, 'Title is required'),
    permalink: z
      .string()
      .min(1, 'Permalink is required')
      .refine(
        (permalink) => !validTags.has(permalink),
        (permalink) => ({
          message: `Permalink "${permalink}" conflicts with an existing tag. Tags are reserved and cannot be used as permalinks. Available tags: ${Array.from(validTags).join(', ')}`,
        }),
      ),
    tag: z
      .string()
      .min(1, 'Tag is required')
      .refine(
        (tag) => validTags.has(tag),
        (tag) => ({
          message: `Tag "${tag}" is not defined in tag.schema.json. Valid tags: ${Array.from(validTags).join(', ')}`,
        }),
      ),
  }),
});

export const collections = {
  articles: articlesCollection,
};
