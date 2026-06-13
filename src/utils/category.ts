/**
 * レイヤー画面のアコーディオン（FolderBlock）の開閉を初期化する。
 * セクションナビからのジャンプは Toc コンポーネント側（utils/toc.ts）が担う。
 */
export function initCategory() {
  document.querySelectorAll<HTMLButtonElement>('[data-folder-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const block = button.closest<HTMLElement>('.folder-block');
      if (!block) return;

      const willOpen = block.dataset.open !== 'true';
      block.dataset.open = String(willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });
}
