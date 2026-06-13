export const SIDEBAR_ID = 'sidebar';
const STORAGE_KEY = 'sidebar-open';

/**
 * localStorage に保存された開いているレイヤー id の集合を読み込む
 */
function loadOpenState(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);

    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * 開いているレイヤー id の集合を localStorage に保存する
 */
function saveOpenState(state: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
  } catch {
    // 保存失敗は無視する
  }
}

/**
 * サイドバーツリーの開閉を初期化する。
 * サーバー側で現在地の祖先は data-open="true" 済み。これに保存済みの開閉状態をマージし、
 * 開閉トグルにイベントを登録する
 */
export function initSidebar() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (!sidebar) return;

  const stored = loadOpenState();

  sidebar.querySelectorAll<HTMLElement>('.folder-node[data-layer-id]').forEach((node) => {
    const id = node.dataset.layerId;
    // 保存済みで開いていたものを復元する（現在地の祖先はサーバー側で既に開いている）
    if (id && stored.has(id)) {
      node.dataset.open = 'true';
    }
  });

  sidebar.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach((button) => {
    button.addEventListener('click', onToggle);
  });
}

function onToggle(event: Event) {
  event.preventDefault();

  const button = event.currentTarget as HTMLElement;
  const node = button.closest<HTMLElement>('.folder-node');
  if (!node) return;

  const willOpen = node.dataset.open !== 'true';
  node.dataset.open = String(willOpen);

  const id = node.dataset.layerId;
  if (!id) return;

  const stored = loadOpenState();
  if (willOpen) {
    stored.add(id);
  } else {
    stored.delete(id);
  }
  saveOpenState(stored);
}
