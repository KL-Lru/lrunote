import tagSchemaJson from '@/tag.schema.json';

export const tagSchema = tagSchemaJson;

// Extract all valid tag paths from the tag structure
export function extractTagPaths(
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
