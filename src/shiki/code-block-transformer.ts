import type { ShikiTransformer } from 'shiki';
import { h } from 'hastscript';
import { icons } from '@iconify-json/mdi';

const mdiIcons = icons.icons;

function mdiIcon(name: string, cls: string) {
  const body = mdiIcons[name]?.body ?? '';
  return h('svg',
    {
      class: cls,
      width: '1em',
      height: '1em',
      fill: 'currentColor',
    }, body);
}

export function codeBlockTransformer(): ShikiTransformer {
  return {
    name: 'code-block-wrapper',
    pre(node) {
      const lang = this.options.lang || '';
      const rawMeta = (this.options.meta as { __raw?: string } | undefined)?.__raw ?? '';
      const titleMatch = rawMeta.match(/title=["']([^"']+)["']/);
      const label = titleMatch?.[1] ?? lang;

      const header = h('div', { class: 'code-block-header' }, [
        h('span', { class: 'code-block-lang' }, label),
        h('button', { class: 'code-block-copy', type: 'button' }, [
          mdiIcon('copy', 'icon-copy'),
          mdiIcon('check', 'icon-check'),
        ]),
      ]);

      return h('div', { class: 'code-block-wrapper' }, [
        header,
        node,
      ]);
    },
  };
}
