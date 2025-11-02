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
    const currentPath = prefix ? `${prefix}/${key}` : key;

    // Add current path
    paths.push(currentPath);

    // Process array elements recursively
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          paths.push(...extractTagPaths(item as Record<string, unknown>, currentPath));
        }
      }
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
    permalink: z.string().min(1, 'Permalink is required'),
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
