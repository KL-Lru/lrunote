import tagSchemaJson from '@/tag.schema.json';
import { dig } from './object';
import { sluggedArticle } from './articles';

const tagSchema = tagSchemaJson as TagSchema;

interface TagSchema {
  [key: string]: TagSchema;
}

export interface TagInfo {
  tag: string;
  parentTag: string | null;
  childTags: string[];
}

/**
 * タグ情報を取得
 * @param {string} tag
 * @returns {TagInfo}
 */
function tagToInfo(tag: string): TagInfo {
  return {
    tag,
    parentTag: parentTag(tag),
    childTags: childTags(tag),
  };
}

/**
 * 現在のコンテンツのタグ情報
 */
export async function currentTag(url: URL | undefined): Promise<TagInfo | null> {
  if (!url) {
    return null;
  }

  // 現在のパスがタグページならそのタグ情報を返す
  const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  if (tagExists(path)) {
    return tagToInfo(path);
  }

  // 現在のパスがページの場合、そのタグ情報を返す
  if (!path.includes('/')) {
    const article = await sluggedArticle(path);

    if (article) {
      const tag = article.data.tag;
      return tagToInfo(tag);
    }
  }

  return null;
}

/**
 * タグの存在確認
 * @param {string} tag
 */
export function tagExists(tag: string | null): boolean {
  if (tag === null) {
    return false;
  }
  return dig(tagSchema, ...tag.split('/')) !== undefined;
}

/**
 * 全タグの情報を錬成
 * @param allArticles
 * @returns
 */
export function tagCollection(): Array<TagInfo> {
  return allTagPaths().map(tagToInfo);
}

/**
 * 全タグパスの抽出
 * @param {TagSchema} schema
 * @param {string} prefix
 * @returns {string[]}
 */
export function allTagPaths(
  schema: TagSchema = tagSchema,
  prefix = '',
): string[] {
  return Object.entries(schema).map(([tag, subSchema]) => {
    const currentPath = prefix ? `${prefix}/${tag}` : tag;

    return [
      currentPath,
      ...allTagPaths(subSchema as TagSchema, currentPath),
    ];
  }).flat();
}

/**
 * 親タグの取得
 * @param {string} tag
 * @returns {string | null}
 */
export function parentTag(tag: string): string | null {
  const paths = tag.split('/');

  // TOP レベルタグ
  if (paths.length <= 1) {
    return null;
  }

  return paths.slice(0, -1).join('/');
}

/**
 * 子タグの取得
 * @param {string} tag
 * @returns {string[]}
 */
export function childTags(tag: string): string[] {
  const paths = tag.split('/');

  const currentLayer = paths.reduce((schema, segment) => {
    return (schema[segment as keyof typeof schema] || {}) as TagSchema;
  }, tagSchema);

  return Object.keys(currentLayer).map((child) => `${tag}/${child}`);
}
