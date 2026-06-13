/**
 * 目次（Toc）に表示する 1 項目。記事の見出しでもレイヤーのセクションでも共通で扱う。
 */
export type TocItem = {
  /** 表示ラベル */
  label: string;
  /** ジャンプ先要素の id（先頭の # は含めない） */
  targetId: string;
  /** インデント階層。1 が最上位 */
  depth: number;
};

/**
 * 目次（Toc）の初期化。
 * scroll-spy を仕込む
 */
export function initToc() {
  const targets = currentTocTargets();
  if (targets.length === 0) return;

  const scrollRoot = document.querySelector<HTMLElement>('.mainContent');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveToc(entry.target.id);
      });
    },
    { root: scrollRoot, threshold: 0 },
  );

  targets.forEach((target) => observer.observe(target));
}

export function currentTocLinks() {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
}

function currentTocTargets() {
  const links = currentTocLinks();
  return links
    .map((link) => (link.dataset.tocLink ? document.getElementById(link.dataset.tocLink) : null))
    .filter((element): element is HTMLElement => element !== null);
}

function setActiveToc(id: string | null) {
  const links = currentTocLinks();
  links.forEach((link) => {
    link.classList.toggle('active', link.dataset.tocLink === id);
  });
}
