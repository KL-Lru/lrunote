import { getCollection, type CollectionEntry } from 'astro:content';
import { parentFolder } from './paths';

type Article = CollectionEntry<'articles'>;

/**
 * 記事コレクションをすべて取得
 * @returns {Promise<Array<Article>>}
 */
export async function articleCollection(): Promise<Array<Article>> {
  return await getCollection('articles');
}

/**
 * パーマリンクに紐づく記事を取得
 * @param {string} slug
 * @returns {Promise<Article | undefined>}
 */
export async function permanentArticle(slug: string): Promise<Article | undefined> {
  return (await articleCollection()).find((article) => article.data.permalink === slug);
}

/**
 * 特定ディレクトリ配下の記事を取得
 * @param {string} folder - ディレクトリパス
 * @returns {Promise<Array<Article>>}
 */
export async function articlesInFolder(folder: string): Promise<Array<Article>> {
  return (await articleCollection()).filter((article) => {
    return parentFolder(article.id) === folder;
  });
}

/**
 * 指定パスに記事が存在するか確認
 * @param {string} path - 記事パス
 * @returns {Promise<boolean>}
 */
export async function articleExists(path: string): Promise<boolean> {
  const articles = await articleCollection();

  return articles.some((article) => idToPath(article) === path);
}

function idToPath(article: Article): string {
  return article.id.replace(/\.mdx?$/, '');
}
