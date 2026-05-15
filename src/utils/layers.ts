import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { absolute, join, parent, relative } from './paths';
import { articleCollection, articleExists, type WrappedArticle } from './articles';

type Layer = CollectionEntry<'layers'>;
type Section = { title: string; items: Array<string> };
type SectionContent = { title: string; items: Array<Content> };
type LayerContent = { title: string; sections: Array<SectionContent> };
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

async function hasLayer(path: string): Promise<boolean> {
  return !!await getEntry('layers', path);
}

/**
 * レイヤーコレクションをすべて取得
 */
export async function layerCollection() {
  return (await getCollection('layers')).map(extend);
}

/**
 * 親のレイヤーを取得
 * @param layerId
 */
export async function parentLayer(layerId: Layer['id']) {
  const parentPath = parent(absolute(layerId));
  if (!parentPath) {
    return null;
  }

  const layerPath = (await findLayer(parentPath));
  if (!layerPath) {
    return null;
  }

  const layer = await getEntry('layers', layerPath)!;

  return extend(layer);
}

/**
 * ID でコンテンツを 1 件取得
 */
export async function resolveContent(id: string): Promise<Content | null> {
  const absId = absolute(id);

  // 記事とディレクトリが同一 ID で存在する場合は記事を優先する
  const article = (await articleCollection()).find((a) => absolute(a.id) === absId);
  if (article) return article;

  // それ以外はレイヤと見て取得する
  const layer = (await layerCollection()).find((l) => absolute(l.id) === absId);
  if (layer) return layer;

  return null;
}

/**
 * セクションに指定されたコンテンツを解決する
 */
async function resolveSection(layer_id: string, section: Section): Promise<SectionContent> {
  const contents = await Promise.all(section.items.map(async (item) => await resolveContent(join(layer_id, item))));

  return {
    ...section,
    items: contents.filter((content) => !!content),
  };
}

/**
 * レイヤ指定を解決する
 */
export async function resolveLayer(layer: Layer): Promise<LayerContent> {
  const sections = await Promise.all((layer.data.sections || []).map(async (section) => await resolveSection(layer.id, section)));

  return { title: layer.data.title, sections };
}

/**
 * 現在表示すべきレイヤーを返す。記事パスの場合は親ディレクトリから上へ再帰的に探索し、
 * .layer.toml が存在する最初のディレクトリを返す
 */
export async function findLayer(path: string): Promise<string | null> {
  // パスに記事が指定されている場合はその親ディレクトリを参照する
  let current = (await articleExists(path)) ? parent(path) : path;

  while (current !== null) {
    if (await hasLayer(current)) return current;
    current = parent(current);
  }

  return null;
}
