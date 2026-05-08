export const SIDEBAR_ID = 'sidebar';

export const DATA_ATTRS = {
  PATH: 'data-path',
  CURRENT_PATH: 'data-current-path',
  TARGET_PATH: 'data-target-path',
  ACTIVE: 'data-active',
  SLIDE_DIRECTION: 'data-slide-direction',
};

/**
 * Sidebar 要素を取得する
 */
function sidebarElement() {
  return document.getElementById(SIDEBAR_ID);
}

/**
 * Sidebar レイヤー要素を取得する
 */
function sidebarLayers() {
  const sidebar = sidebarElement();

  return sidebar ? Array.from(sidebar.querySelectorAll(`[${DATA_ATTRS.PATH}]`)) : [];
}

/**
 * 現在アクティブなレイヤーのパスを取得する
 * @returns
 */
function currentPath() {
  return sidebarElement()?.getAttribute(DATA_ATTRS.CURRENT_PATH) || '';
}

/**
 * レイヤーをアクティブにする
 * @param layer
 * @param direction
 */
function activateLayer(layer: Element, direction: 'left' | 'right') {
  layer.setAttribute(DATA_ATTRS.ACTIVE, 'true');
  layer.setAttribute(DATA_ATTRS.SLIDE_DIRECTION, direction);

  const resetAnimation = () => {
    layer.removeAttribute(DATA_ATTRS.SLIDE_DIRECTION);
    layer.removeEventListener('animationend', resetAnimation);
  };

  layer.addEventListener('animationend', resetAnimation);
  sidebarElement()?.setAttribute(DATA_ATTRS.CURRENT_PATH, layer.getAttribute(DATA_ATTRS.PATH) || '');
}

/**
 * レイヤーを非アクティブにする
 * @param layer
 */
function deactivateLayer(layer: Element) {
  layer.setAttribute(DATA_ATTRS.ACTIVE, 'false');
}

/**
 * 移動方向を計算する
 * @param currentPath
 * @param targetPath
 * @returns
 */
function movementDirection(currentPath: string, targetPath: string): 'left' | 'right' {
  if (currentPath.includes(targetPath)) {
    // 親カテゴリへ移動
    return 'right';
  } else {
    // 子カテゴリへ移動
    return 'left';
  }
}

/**
 * 指定されたパスに切り替える
 * @param targetPath
 */
export function switchToPath(targetPath: string) {
  const current = currentPath();
  const direction = movementDirection(current, targetPath);

  sidebarLayers().forEach((layer) => {
    const layerPath = layer.getAttribute(DATA_ATTRS.PATH);
    if (layerPath === targetPath) {
      activateLayer(layer, direction);
    } else {
      deactivateLayer(layer);
    }
  });
}
