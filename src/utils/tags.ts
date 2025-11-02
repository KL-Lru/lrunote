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

// Get parent tag of a given tag
export function getParentTag(tag: string): string | null {
  const parts = tag.split('/');
  if (parts.length <= 1) {
    return null; // No parent for top-level tags
  }
  return parts.slice(0, -1).join('/');
}

// Get child tags of a given tag
export function getChildTags(tag: string): string[] {
  const allTags = extractTagPaths(tagSchema);
  const prefix = `${tag}/`;

  return allTags.filter((t) => {
    // Check if it starts with the prefix and has exactly one more segment
    if (!t.startsWith(prefix)) return false;
    const remainder = t.slice(prefix.length);
    return !remainder.includes('/');
  });
}

export interface TagInfo {
  tag: string;
  parentTag: string | null;
  childTags: string[];
  articles: Array<{ permalink: string; title: string }>;
}

// Generate all tags information for client-side use
export async function generateAllTagsInfo(
  allArticles: Array<{ data: { tag: string; permalink: string; title: string } }>,
): Promise<Record<string, TagInfo>> {
  const allTags = extractTagPaths(tagSchema);
  const tagInfoMap: Record<string, TagInfo> = {};

  for (const tag of allTags) {
    const parentTag = getParentTag(tag);
    const childTags = getChildTags(tag);
    const articles = allArticles
      .filter((article) => article.data.tag === tag)
      .map((article) => ({
        permalink: article.data.permalink,
        title: article.data.title,
      }));

    tagInfoMap[tag] = {
      tag,
      parentTag,
      childTags,
      articles,
    };
  }

  return tagInfoMap;
}
