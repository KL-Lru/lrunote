import { visit } from 'unist-util-visit';
import { D2 } from '@terrastruct/d2';
import type { Root, Code, Parent } from 'mdast';

// themeID:301 (TerminalGrayscale) が出力するグレースケール各色を、
// サイトのテーマ変数へ意味づけしてマッピングする。
// これにより SVG が <html>.light / .dark のトグルへ追従する。
const COLOR_MAP: Record<string, string> = {
  '#000410': 'var(--text-color)', // 文字・枠線・線・矢印
  'black': 'var(--text-color)',
  '#ffffff': 'var(--background-color)', // ノード塗り・図の背景
  'white': 'var(--background-color)',
  '#f5f6f9': 'var(--control-background-color)', // 薄い塗り
  '#e7e9ee': 'var(--control-background-color)',
  '#eef1f8': 'var(--control-background-color)',
  '#9499ab': 'var(--border-color)', // 補助線・グリッド
  '#6d7284': 'var(--border-color)',
};

function mapColor(value: string): string | null {
  const key = value.trim().toLowerCase();
  if (key in COLOR_MAP) return COLOR_MAP[key];

  // 3桁 hex を 6桁へ正規化して再照合
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(key);
  if (short) {
    const full = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
    if (full in COLOR_MAP) return COLOR_MAP[full];
  }
  return null;
}

// SVG 内の fill / stroke（属性・style プロパティ）だけを対象に色を置換する。
// 文脈を fill=/stroke= に限定し、font-face の base64 やテキスト本文を壊さない。
export function themeColors(svg: string): string {
  return svg
    .replace(/\b(fill|stroke)="([^"]*)"/g, (m, prop: string, val: string) => {
      const mapped = mapColor(val);
      return mapped ? `${prop}="${mapped}"` : m;
    })
    .replace(/\b(fill|stroke)\s*:\s*([^;"'}]+)/g, (m, prop: string, val: string) => {
      const mapped = mapColor(val);
      return mapped ? `${prop}:${mapped}` : m;
    });
}

// D2 は worker + WASM で重いので 1 インスタンスを共有する。
// worker.unref() でビルド完了後にプロセスが自然終了できるようにする（ハング防止）。
let instance: Promise<D2> | null = null;
function getD2(): Promise<D2> {
  if (!instance) {
    instance = (async () => {
      const d2 = new D2();
      await (d2 as unknown as { ready: Promise<void> }).ready;
      (d2 as unknown as { worker?: { unref?: () => void } }).worker?.unref?.();
      return d2;
    })();
  }
  return instance;
}

async function d2ToInlineSvg(source: string): Promise<string> {
  const d2 = await getD2();
  const result = await d2.compile(source, {
    themeID: 301, // TerminalGrayscale: グレースケールでテーマ変数へ寄せやすい
    sketch: false,
    pad: 20,
    noXMLTag: true,
  });
  const svg = await d2.render(result.diagram, result.renderOptions);
  return `<div class="svg-inline">${themeColors(svg)}</div>`;
}

export function remarkD2() {
  return async (tree: Root) => {
    // unist-util-visit は同期なので、まず対象を収集する
    const targets: { parent: Parent; index: number; value: string }[] = [];
    visit(tree, 'code', (node: Code, index: number | undefined, parent: Parent | undefined) => {
      if (node.lang !== 'd2') return;
      if (index === undefined || parent === undefined) return;
      targets.push({ parent, index, value: node.value });
    });
    if (targets.length === 0) return;

    // D2 は 1 インスタンス(worker)を共有しているため、compile/render を
    // 並行実行するとワーカー上の呼び出しが交錯し結果が壊れる。
    // 逐次に変換する（1 ワーカーなので並行にしても実質速くはならない）。
    // 失敗時は null にしてビルドを止めない。
    const htmls: (string | null)[] = [];
    for (const t of targets) {
      const html = await d2ToInlineSvg(t.value).catch((e: unknown) => {
        console.error('[remark-d2] failed to render diagram:', e);
        return null;
      });
      htmls.push(html);
    }

    // 同一 parent 内での index ずれを避けるため後方から差し替える
    for (let i = targets.length - 1; i >= 0; i--) {
      const html = htmls[i];
      if (html == null) continue;
      const { parent, index } = targets[i];
      parent.children[index] = { type: 'html', value: html };
    }
  };
}
