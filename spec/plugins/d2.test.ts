import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Root, Code, Html } from 'mdast';

// D2 (worker + WASM) はテストで実走させず、compile/render をスタブする。
// 検証対象はプラグインのロジック（ノード差し替え・色マッピング）。
const { renderMock } = vi.hoisted(() => ({
  renderMock: vi.fn<() => Promise<string>>(),
}));

vi.mock('@terrastruct/d2', () => ({
  D2: class {
    ready = Promise.resolve();
    worker = { unref() {} };
    compile(src: string) {
      return Promise.resolve({ diagram: src, renderOptions: {} });
    }

    render = renderMock;
  },
}));

import { remarkD2, themeColors } from '@/plugins/d2';

const run = (tree: Root) => remarkD2()(tree);
const codeTree = (lang: string | null, value: string): Root => ({
  type: 'root',
  children: [{ type: 'code', lang, meta: null, value } satisfies Code],
});

beforeEach(() => {
  renderMock.mockReset();
  renderMock.mockResolvedValue('<svg><rect fill="#FFFFFF"/><path stroke="#000410"/></svg>');
});

describe('themeColors', () => {
  it('should map grayscale hex fills/strokes to theme css variables', () => {
    const out = themeColors('<rect fill="#FFFFFF"/><path stroke="#000410"/>');
    expect(out).toContain('fill="var(--background-color)"');
    expect(out).toContain('stroke="var(--text-color)"');
    expect(out).not.toMatch(/#FFFFFF|#000410/i);
  });

  it('should map named colors only inside fill/stroke context', () => {
    // 属性値の black は置換、テキスト本文の "black" はそのまま残す
    expect(themeColors('<text fill="black">black</text>'))
      .toBe('<text fill="var(--text-color)">black</text>');
  });

  it('should leave none / transparent untouched', () => {
    const svg = '<rect fill="none" stroke="transparent"/>';
    expect(themeColors(svg)).toBe(svg);
  });

  it('should map fill declared inside a style property', () => {
    expect(themeColors('<g style="fill:#000410;font-size:16px"/>'))
      .toContain('fill:var(--text-color)');
  });

  it('should not touch base64 font data', () => {
    const svg = 'src:url("data:application/font-woff;base64,d09GRgABwhiteblack==")';
    expect(themeColors(svg)).toBe(svg);
  });
});

describe('remarkD2', () => {
  it('should replace a d2 code block with an inline svg html node', async () => {
    const tree = codeTree('d2', 'x -> y');
    await run(tree);

    const node = tree.children[0] as Html;
    expect(node.type).toBe('html');
    expect(node.value).toContain('class="svg-inline"');
    expect(node.value).toContain('<svg');
  });

  it('should map colors of the rendered svg to theme variables', async () => {
    const tree = codeTree('d2', 'x');
    await run(tree);

    const value = (tree.children[0] as Html).value;
    expect(value).toMatch(/var\(--/);
    expect(value).not.toMatch(/#FFFFFF|#000410/i);
  });

  it('should leave non-d2 code blocks untouched', async () => {
    const tree = codeTree('ts', 'const a = 1;');
    await run(tree);

    expect(tree.children[0].type).toBe('code');
    expect(renderMock).not.toHaveBeenCalled();
  });

  it('should keep the original code block when rendering throws', async () => {
    renderMock.mockRejectedValueOnce(new Error('boom'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const tree = codeTree('d2', 'broken');
    await run(tree);

    expect(tree.children[0].type).toBe('code');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
