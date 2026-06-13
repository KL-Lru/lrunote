import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { absolute, parent, relative } from './paths';

type Layer = CollectionEntry<'layers'>;
export type WrappedLayer = Layer & {
  slug: string;
};

export function extend(layer: Layer): WrappedLayer {
  return {
    ...layer,
    // StaticPaths 展開用の slug プロパティは相対パス指定が必要
    slug: relative(layer.id),
  };
}

/**
 * 指定パスにレイヤー (.layer.toml) が存在するか確認
 */
export async function hasLayer(path: string): Promise<boolean> {
  return !!(await getEntry('layers', absolute(path)));
}

/**
 * レイヤーコレクションをすべて取得
 */
export async function layerCollection() {
  return (await getCollection('layers')).map(extend);
}

/**
 * 現在表示すべきレイヤーを返す。記事パスの場合は親ディレクトリから上へ再帰的に探索し、
 * .layer.toml が存在する最初のディレクトリを返す
 */
export async function findLayer(path: string): Promise<string | null> {
  const layers = await layerCollection();
  const exists = (p: string) => layers.some((l) => l.id === absolute(p));

  // パス自身がレイヤーでなければ親ディレクトリへ遡る
  let current: string | null = exists(path) ? absolute(path) : parent(absolute(path));

  while (current !== null) {
    if (exists(current)) return current;
    current = parent(current);
  }

  return null;
}
