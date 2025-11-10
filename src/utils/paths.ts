import path from 'path';
import fs from 'fs';

/**
 * 親ディレクトリパスを取得
 * @param {string} currentPath - ディレクトリパス
 * @returns {string | null}
 */
export function parentFolder(currentPath: string): string | null {
  if (currentPath === '') {
    return null;
  }
  const dir = path.dirname(currentPath);

  return dir === '.' ? '' : dir;
}

/**
 * 子ディレクトリパスを取得
 * @param {string} currentPath - ディレクトリパス
 * @returns {string[]}
 */
export function childFolders(currentPath: string): string[] {
  if (!fs.existsSync(currentPath) || !fs.lstatSync(currentPath).isDirectory()) {
    return [];
  }
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(currentPath, entry.name));
}
