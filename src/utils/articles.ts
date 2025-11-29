import { getCollection, type CollectionEntry } from 'astro:content';
import { absolute, parent, relative } from './paths';

type Article = CollectionEntry<'articles'>;

export type WrappedArticle = Article & {
  slug: string;
};

function extend(article: Article): WrappedArticle {
  return {
    ...article,
    // StaticPaths 展開用の slug プロパティは相対パス指定が必要
    slug: relative(article.id),
  };
}

/**
 * 記事コレクションをすべて取得
 */
export async function articleCollection() {
  return (await getCollection('articles')).map(extend);
}

/**
 * パーマリンクに紐づく記事を取得
 * @param {string} perm
 */
export async function permanentArticle(perm: string) {
  return (await articleCollection()).find((article) => absolute(article.data.permalink) === absolute(perm));
}

/**
 * 特定ディレクトリ配下の記事を取得
 * @param {string} path - ディレクトリパス
 */
export async function articlesInFolder(path: string) {
  return (await articleCollection()).filter((article) => {
    return parent(absolute(article.id)) === absolute(path);
  });
}

/**
 * 指定パスに記事が存在するか確認
 * @param {string} path - 記事パス (no slash)
 */
export async function articleExists(path: string) {
  const articles = await articleCollection();

  return articles.some((article) => absolute(article.id) === absolute(path));
}
