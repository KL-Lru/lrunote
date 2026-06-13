import { articleCollection, type WrappedArticle } from './articles';
import { layerCollection, type WrappedLayer } from './layers';
import { absolute, parent } from './paths';

export type ArticleNode = {
  type: 'article';
  id: string;
  slug: string;
  title: string;
  description?: string;
};

export type LayerNode = {
  type: 'layer';
  id: string;
  slug: string;
  title: string;
  description?: string;
  children: TreeNode[];
};

export type TreeNode = ArticleNode | LayerNode;

export type Crumb = {
  id: string;
  slug: string;
  title: string;
  type: 'layer' | 'article';
};

/**
 * id の末尾セグメント（ディレクトリ名 / ファイル名）を取得
 */
function nodeName(id: string): string {
  const segments = absolute(id).split('/').filter(Boolean);

  return segments[segments.length - 1] ?? '';
}

/**
 * order に従って子ノードを並べ替える。order 未記載分は末尾にファイル名/ディレクトリ名昇順で続く
 */
function sortChildren(children: TreeNode[], order: string[] = []): TreeNode[] {
  const indexOf = (node: TreeNode) => {
    const position = order.indexOf(nodeName(node.id));

    return position === -1 ? Number.POSITIVE_INFINITY : position;
  };

  return [...children].sort((a, b) => {
    const indexA = indexOf(a);
    const indexB = indexOf(b);
    // 両方とも order 未記載の場合は名前昇順へ落とす。
    if (indexA !== indexB) return indexA - indexB;

    return nodeName(a.id).localeCompare(nodeName(b.id));
  });
}

/**
 * レイヤーを起点に、直下の子レイヤー/記事を再帰的に解決してツリーノードを構築する
 */
function build(layer: WrappedLayer, layers: WrappedLayer[], articles: WrappedArticle[]): LayerNode {
  const childLayers: TreeNode[] = layers
    .filter((candidate) => candidate.id !== layer.id && parent(candidate.id) === layer.id)
    .map((candidate) => build(candidate, layers, articles));

  const childArticles: TreeNode[] = articles
    .filter((article) => parent(article.id) === layer.id)
    .map((article) => ({
      type: 'article',
      id: article.id,
      slug: article.slug,
      title: article.data.title,
      description: article.data.description,
    }));

  return {
    type: 'layer',
    id: layer.id,
    slug: layer.slug,
    title: layer.data.title,
    description: layer.data.description,
    children: sortChildren([...childLayers, ...childArticles], layer.data.order),
  };
}

/**
 * ルート (/) から構築したサイト全体のツリーを返す
 */
export async function siteTree(): Promise<LayerNode> {
  const layers = await layerCollection();
  const articles = await articleCollection();
  const root = layers.find((layer) => layer.id === '/')!;

  return build(root, layers, articles);
}

/**
 * 指定レイヤーを起点としたツリーノードを返す
 */
export async function layerTree(layerId: string): Promise<LayerNode | null> {
  const layers = await layerCollection();
  const articles = await articleCollection();
  const layer = layers.find((layer) => layer.id === absolute(layerId));

  if (!layer) {
    return null;
  }

  return build(layer, layers, articles);
}

/**
 * そのノードに至るまでのパスを返却する
 */
export async function pathTo(id: string): Promise<Crumb[]> {
  const layers = await layerCollection();
  const articles = await articleCollection();
  const absId = absolute(id);

  const ancestors: Crumb[] = [];

  let current = parent(absId);
  while (current !== null) {
    const layer = layers.find((layer) => layer.id === current);
    if (layer && layer.id !== '/') {
      ancestors.push({ id: layer.id, slug: layer.slug, title: layer.data.title, type: 'layer' });
    }
    current = parent(current);
  }
  ancestors.reverse();

  const article = articles.find((article) => article.id === absId);
  if (article) {
    ancestors.push({ id: article.id, slug: article.slug, title: article.data.title, type: 'article' });

    return ancestors;
  }

  const layer = layers.find((layer) => layer.id === absId);
  if (layer && layer.id !== '/') {
    ancestors.push({ id: layer.id, slug: layer.slug, title: layer.data.title, type: 'layer' });

    return ancestors;
  }

  return [];
}
