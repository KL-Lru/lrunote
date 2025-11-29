import path from 'path';
import { articleExists } from './articles';

/**
 * 親ディレクトリパスを取得
 * @param {string} currentPath - ディレクトリパス
 * @returns {string | null}
 */
export function parent(currentPath: string): string | null {
  if (currentPath === '' || currentPath === '/') {
    return null;
  }
  const dir = path.dirname(currentPath);

  return dir === '.' ? '' : dir;
}

/**
 * パスを絶対パスに変換. ファイルパスではなくURLパスとしての変換であり, 先頭にスラッシュを付与するのみ
 * @param path
 * @returns
 */
export function absolute(path: string) {
  if (path.startsWith('/')) {
    return path;
  }

  return '/' + path;
}

/**
 * パスを相対パスに変換. ファイルパスではなくURLパスとしての変換であり, 先頭のスラッシュを削除するのみ
 * @param path
 * @returns
 */
export function relative(path: string) {
  while (path.startsWith('/')) {
    path = path.slice(1);
  }

  return path;
}

export function join(...paths: string[]) {
  return paths.map((p) => clean(p)).join('/');
}

export function clean(path: string) {
  return path.replace(/\/+$/g, '');
}

export async function currentLayer(path: string) {
  if (await articleExists(path)) {
    return parent(path);
  }
  return path;
}
