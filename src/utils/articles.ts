import { getCollection, type CollectionEntry } from 'astro:content';

type Article = CollectionEntry<'articles'>;

/**
 * 記事コレクションをすべて取得
 * @returns {Promise<Array<Article>>}
 */
export async function articleCollection(): Promise<Array<Article>> {
  return await getCollection('articles');
}

/**
 * タグに紐づく記事を取得
 * @param {string} tag
 * @returns {Promise<Array<Article>>}
 */
export async function taggedArticles(tag: string): Promise<Array<Article>> {
  return (await articleCollection()).filter((article) => article.data.tag === tag);
}

/**
 * パーマリンクに紐づく記事を取得
 * @param {string} slug
 * @returns {Promise<Article | undefined>}
 */
export async function sluggedArticle(slug: string): Promise<Article | undefined> {
  return (await articleCollection()).find((article) => article.data.permalink === slug);
}
