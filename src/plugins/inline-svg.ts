import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { visit } from 'unist-util-visit';
import type { Root, Image, Parent } from 'mdast';
import type { VFile } from 'vfile';

function replaceColors(svg: string) {
  return svg.replaceAll(
    /(stroke|fill)="#([0-9a-f]{6})"/gi,
    `$1="currentColor"`
  );
}

export function remarkInlineSvg() {
  return (tree: Root, vfile: VFile) => {
    const mdDir = dirname(vfile.path);

    visit(tree, 'image', (node: Image, index: number | undefined, parent: Parent | undefined) => {
      if (!node.url?.endsWith('.svg')) return;
      if (index === undefined || parent === undefined) return;

      const filePath = resolve(mdDir, node.url);

      try {
        const svgContent = replaceColors(readFileSync(filePath, 'utf-8'));
        parent.children[index] = {
          type: 'html',
          value: `<div class="svg-inline">${svgContent}</div>`
        };
      } catch {
        // 読めなければ img のまま
      }
    });
  };
}
