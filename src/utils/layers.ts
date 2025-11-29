import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { absolute, parent, relative } from './paths';
import { articlesInFolder, type WrappedArticle } from './articles';

type Layer = CollectionEntry<'layers'>;
export type Content = WrappedLayer | WrappedArticle;
export type WrappedLayer = Layer & {
  slug: string;
};

function extend(layer: Layer): WrappedLayer {
  return {
    ...layer,
    // StaticPaths 展開用の slug プロパティは相対パス指定が必要
    slug: relative(layer.id),
  };
}

/**
 * レイヤーコレクションをすべて取得
 */
export async function layerCollection() {
  return (await getCollection('layers')).map(extend);
}

/**
 * 特定ディレクトリのレイヤーを取得
 * @param {string} folder - ディレクトリパス
 */
export async function layersInFolder(folder: string) {
  return (await layerCollection()).filter((layer) => {
    return parent(absolute(layer.id)) === absolute(folder);
  });
}

/**
 * 親階層のレイヤーを取得
 * @param layerId
 */
export async function parentLayer(layerId: Layer['id']) {
  const parentPath = parent(absolute(layerId));
  if (!parentPath) {
    return null;
  }

  const layer = (await getEntry('layers', parentPath));
  if (!layer) {
    return null;
  }

  return extend(layer);
}

/**
 * 子階層のレイヤーを取得
 * @param layerId
 */
export async function childLayers(layerId: Layer['id']) {
  const layerPath = absolute(layerId);

  return (await layerCollection()).filter((layer) => {
    return parent(absolute(layer.id)) === layerPath;
  });
}

/**
 * 管轄レイヤー内に含まれる全てのコンテンツを取得
 * @param layerId
 * @returns
 */
export async function layerContents(layerId: Layer['id']) {
  const children: Array<Content> = await childLayers(layerId);
  const articles: Array<Content> = await articlesInFolder(layerId);

  return [...children, ...articles].reduce((acc, cur) => {
    acc[cur.id] = cur;

    return acc;
  }, {} as Record<string, Content>);
}
