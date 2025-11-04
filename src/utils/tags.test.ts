import { describe, expect, test } from 'vitest';
import {
  tagExists,
  allTagPaths,
  parentTag,
  childTags,
  tagCollection,
  currentTag,
  tagLabel,
} from './tags';

describe('tagExists', () => {
  test('returns true for existing tags', () => {
    expect(tagExists('top')).toBe(true);
    expect(tagExists('frontend/react')).toBe(true);
  });

  test('returns false for non-existing tags', () => {
    expect(tagExists('nonexistent')).toBe(false);
  });

  test('returns false for null', () => {
    expect(tagExists(null)).toBe(false);
  });
});

describe('allTagPaths', () => {
  test('returns all tag paths from schema', () => {
    const paths = allTagPaths();

    // トップレベルのタグ
    expect(paths).toContain('top');
    expect(paths).toContain('frontend');
    expect(paths).toContain('backend');

    // ネストされたタグ
    expect(paths).toContain('frontend/react');
    expect(paths).toContain('frontend/vue');
    expect(paths).toContain('frontend/react/components');
    expect(paths).toContain('frontend/react/hooks');
    expect(paths).toContain('backend/nodejs');
  });

  test('returns correct number of paths', () => {
    const paths = allTagPaths();
    expect(paths.length).toBe(8);
  });
});

describe('parentTag', () => {
  test('returns null for top-level tags', () => {
    expect(parentTag('top')).toBe(null);
    expect(parentTag('frontend')).toBe(null);
  });

  test('returns parent tag for nested tags', () => {
    expect(parentTag('frontend/react')).toBe('frontend');
    expect(parentTag('frontend/react/components')).toBe('frontend/react');
  });

  test('returns correct parent for deeply nested tags', () => {
    expect(parentTag('frontend/react/hooks')).toBe('frontend/react');
  });
});

describe('childTags', () => {
  test('returns empty array for tags without children', () => {
    expect(childTags('top')).toEqual([]);
    expect(childTags('frontend/vue')).toEqual([]);
  });

  test('returns child tags for tags with children', () => {
    const frontendChildren = childTags('frontend');
    expect(frontendChildren).toContain('frontend/react');
    expect(frontendChildren).toContain('frontend/vue');
    expect(frontendChildren.length).toBe(2);
  });

  test('returns child tags for nested tags', () => {
    const reactChildren = childTags('frontend/react');
    expect(reactChildren).toContain('frontend/react/components');
    expect(reactChildren).toContain('frontend/react/hooks');
    expect(reactChildren.length).toBe(2);
  });
});

describe('tagCollection', () => {
  test('returns array of TagInfo objects', () => {
    const collection = tagCollection();

    expect(Array.isArray(collection)).toBe(true);
    expect(collection.length).toBeGreaterThan(0);
  });

  test('each TagInfo has required properties', () => {
    const collection = tagCollection();

    collection.forEach((info) => {
      expect(info).toHaveProperty('tag');
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('parentTag');
      expect(info).toHaveProperty('childTags');
      expect(typeof info.tag).toBe('string');
      expect(typeof info.label).toBe('string');
      expect(Array.isArray(info.childTags)).toBe(true);
    });
  });

  test('TagInfo for top-level tag has correct structure', () => {
    const collection = tagCollection();
    const topInfo = collection.find((info) => info.tag === 'top');

    expect(topInfo).toBeDefined();
    expect(topInfo?.label).toBe('トップ');
    expect(topInfo?.parentTag).toBe(null);
    expect(topInfo?.childTags).toEqual([]);
  });

  test('TagInfo for nested tag has correct structure', () => {
    const collection = tagCollection();
    const reactInfo = collection.find((info) => info.tag === 'frontend/react');

    expect(reactInfo).toBeDefined();
    expect(reactInfo?.label).toBe('React');
    expect(reactInfo?.parentTag).toBe('frontend');
    expect(reactInfo?.childTags).toContain('frontend/react/components');
    expect(reactInfo?.childTags).toContain('frontend/react/hooks');
  });
});

describe('currentTag', () => {
  test('returns null for undefined URL', async () => {
    const result = await currentTag(undefined);
    expect(result).toBe(null);
  });

  test('returns TagInfo for valid tag path', async () => {
    const url = new URL('http://example.com/frontend/react');
    const result = await currentTag(url);

    expect(result).toBeDefined();
    expect(result?.tag).toBe('frontend/react');
    expect(result?.parentTag).toBe('frontend');
  });

  test('returns TagInfo for top-level tag', async () => {
    const url = new URL('http://example.com/top');
    const result = await currentTag(url);

    expect(result).toBeDefined();
    expect(result?.tag).toBe('top');
    expect(result?.parentTag).toBe(null);
  });

  test('returns null for non-existent tag path', async () => {
    const url = new URL('http://example.com/nonexistent');
    const result = await currentTag(url);

    expect(result).toBe(null);
  });

  test('handles trailing slash correctly', async () => {
    const url = new URL('http://example.com/frontend/react/');
    const result = await currentTag(url);

    expect(result).toBeDefined();
    expect(result?.tag).toBe('frontend/react');
  });

  test('handles leading slash correctly', async () => {
    const url = new URL('http://example.com/top/');
    const result = await currentTag(url);

    expect(result).toBeDefined();
    expect(result?.tag).toBe('top');
  });
});

describe('tagLabel', () => {
  test('returns label for tags with $label', () => {
    expect(tagLabel('top')).toBe('トップ');
    expect(tagLabel('frontend')).toBe('フロントエンド');
    expect(tagLabel('backend')).toBe('バックエンド');
  });

  test('returns label for nested tags', () => {
    expect(tagLabel('frontend/react')).toBe('React');
    expect(tagLabel('frontend/vue')).toBe('Vue');
    expect(tagLabel('backend/nodejs')).toBe('Node.js');
  });

  test('returns label for deeply nested tags', () => {
    expect(tagLabel('frontend/react/components')).toBe('コンポーネント');
    expect(tagLabel('frontend/react/hooks')).toBe('フック');
  });

  test('returns tag name when $label is not defined', () => {
    // タグが存在しない場合、最後の部分を返す
    const result = tagLabel('nonexistent/tag');
    expect(result).toBe('tag');
  });
});
