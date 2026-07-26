import { visit } from 'unist-util-visit';
import { D2 } from '@terrastruct/d2';
import type { Root, Parent } from 'mdast';

const COMPILE_OPTIONS = {
  pad: 20,
  sketch: false,
  noXMLTag: true,
};
const COMPILE_THEME = `
vars: {
  d2-config: {
    theme-id: 0
    theme-overrides: {
      N1: "#000000"   # text color
      N2: "#000000"   # italic text color
      N3: "#000000"   # (Not used currently)
      N4: "#FFFFFF"   # Diamond
      N5: "#FFFFFF"   # Parallelogram, Queue, Hexagon 
      N6: "#FFFFFF"   # (Not used currently)
      N7: "#FFFFFF"   # Rectangle, Cirslr, Callout, Cloud
      B1: "#000000"   # Connection, Border (Solid)
      B2: "#000000"   # Connection, Border (Dashed)
      B3: "#FFFFFF"   # Person, Rectangle, Circle (4th layer)
      B4: "#FFFFFF"   # Rectangle, Circle (3rd layer)
      B5: "#FFFFFF"   # Rectangle, Circle (2nd layer)
      B6: "#FFFFFF"   # Rectangle, Circle (1st layer)
      AA4: "#FFFFFF"  
      AA5: "#FFFFFF"
      AB4: "#FFFFFF"
      AB5: "#FFFFFF"
    }
  }
}

`;

function replaceSvgProperty(svg: string) {
  return svg
    .replaceAll(/\b(stroke|fill)="#0{6}"/gi, `$1="var(--text-color)"`)
    .replaceAll(/\b(stroke|fill)="#F{6}"/gi, `$1="var(--background-color)"`);
}

function replaceStyleProperty(svg: string) {
  return svg
    .replaceAll(/\b(stroke|fill)\s*:\s*#0{6}/gi, `$1: var(--text-color)`)
    .replaceAll(/\b(stroke|fill)\s*:\s*#F{6}/gi, `$1: var(--background-color)`);
}

// SVG 内の fill / stroke（属性・style プロパティ）だけを対象に色を置換する
export function replaceColors(svg: string): string {
  svg = replaceSvgProperty(svg);
  svg = replaceStyleProperty(svg);

  return svg;
}

async function d2ToSvg(source: string): Promise<string> {
  const d2 = new D2();
  const result = await d2.compile(COMPILE_THEME + source, { options: COMPILE_OPTIONS });
  return await d2.render(result.diagram, result.renderOptions);
}

export function remarkD2() {
  return async (tree: Root) => {
    const targets: { parent: Parent; index: number; value: string }[] = [];

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'd2') return;
      if (index === undefined || parent === undefined) return;

      targets.push({ parent, index, value: node.value });
    });
    if (targets.length === 0) return;

    const svgContents: (string | null)[] = [];
    for (const t of targets) {
      const svg = await d2ToSvg(t.value).catch((e: unknown) => {
        console.error('[remark-d2] failed to render diagram:', e);
        return null;
      });
      svgContents.push(svg);
    }

    // 同一 parent 内での index ずれを避けるため後方から差し替える
    for (let i = targets.length - 1; i >= 0; i--) {
      const svg = svgContents[i];
      if (svg == null) continue;

      const { parent, index } = targets[i];
      parent.children[index] = {
        type: 'html',
        value: `<div class="svg-inline">${replaceColors(svg)}</div>`
      };
    }
  };
}
