import path from 'path';

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
