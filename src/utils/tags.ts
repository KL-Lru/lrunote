import tagSchemaJson from '@/tag.schema.json';
import { dig } from './object';
import { sluggedArticle } from './articles';

const tagSchema = tagSchemaJson as TagSchema;

interface TagSchema {
  $label?: string;
  [key: string]: TagSchema | string | undefined;
}

export interface TagInfo {
  tag: string;
  label: string;
  parentTag: string | null;
  childTags: string[];
}

/**
 * タグパスをURLパスに変換
 * @param {string} tag - タグパス (例: "top/frontend/react")
 * @returns {string} - URLパス (例: "frontend/react")
 */
export function tagToUrl(tag: string): string {
  if (tag === 'top') {
    return '';
  }
  if (tag.startsWith('top/')) {
    return tag.slice(4); // "top/" を削除
  }
  return tag;
}

/**
 * URLパスをタグパスに変換
 * @param {string} urlPath - URLパス (例: "frontend/react")
 * @returns {string} - タグパス (例: "top/frontend/react")
 */
export function urlToTag(urlPath: string): string {
  if (urlPath === '' || urlPath === '/') {
    return 'top';
  }
  // 先頭のスラッシュを削除
  const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  return `top/${cleanPath}`;
}

/**
 * タグのラベルを取得
 * @param {string} tag
 * @returns {string}
 */
export function tagLabel(tag: string): string {
  const paths = tag.split('/');
  const schema = dig(tagSchema, ...paths);

  // $label が存在する場合はそれを返す
  if (typeof schema === 'object' && schema !== null && '$label' in schema) {
    const label = schema.$label;
    if (typeof label === 'string') {
      return label;
    }
  }

  // $label がない場合は、タグ名の最後の部分を返す
  return paths[paths.length - 1];
}

/**
 * タグ情報を取得
 * @param {string} tag
 * @returns {TagInfo}
 */
function tagToInfo(tag: string): TagInfo {
  return {
    tag,
    label: tagLabel(tag),
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
  const urlPath = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  const tag = urlToTag(urlPath);

  if (tagExists(tag)) {
    return tagToInfo(tag);
  }

  // 現在のパスがページの場合、そのタグ情報を返す
  if (!urlPath.includes('/')) {
    const article = await sluggedArticle(urlPath);

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
  return Object.entries(schema)
    .filter(([key]) => key !== '$label') // $label を除外
    .map(([tag, subSchema]) => {
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

  return Object.keys(currentLayer)
    .filter((key) => key !== '$label') // $label を除外
    .map((child) => `${tag}/${child}`);
}
