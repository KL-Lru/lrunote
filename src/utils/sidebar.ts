export const SIDEBAR_ID = 'sidebar';

export const SIDEBAR_DATA_ATTRS = {
  PATH: 'data-path',
  CURRENT_PATH: 'data-current-path',
  TARGET_PATH: 'data-target-path',
  ACTIVE: 'data-active',
  SLIDE_DIRECTION: 'data-slide-direction',
};

function sidebarElement() {
  return document.getElementById(SIDEBAR_ID);
}

function sidebarLayers() {
  const sidebar = sidebarElement();

  return sidebar ? sidebar.querySelectorAll(`[${SIDEBAR_DATA_ATTRS.PATH}]`) : [];
}

function currentPath() {
  return sidebarElement()?.getAttribute(SIDEBAR_DATA_ATTRS.CURRENT_PATH) || '';
}

function activateLayer(layer: Element, direction: 'left' | 'right') {
  layer.setAttribute(SIDEBAR_DATA_ATTRS.ACTIVE, 'true');
  layer.setAttribute(SIDEBAR_DATA_ATTRS.SLIDE_DIRECTION, direction);

  const resetAnimation = () => {
    layer.removeAttribute(SIDEBAR_DATA_ATTRS.SLIDE_DIRECTION);
    layer.removeEventListener('animationend', resetAnimation);
  };

  layer.addEventListener('animationend', resetAnimation);
  sidebarElement()?.setAttribute(SIDEBAR_DATA_ATTRS.CURRENT_PATH, layer.getAttribute(SIDEBAR_DATA_ATTRS.PATH) || '');
}

function deactivateLayer(layer: Element) {
  layer.setAttribute(SIDEBAR_DATA_ATTRS.ACTIVE, 'false');
}

function movementDirection(currentPath: string, targetPath: string): 'left' | 'right' {
  if (currentPath.startsWith(targetPath + '/')) {
    // 親カテゴリへ移動
    return 'right';
  } else {
    // 子カテゴリへ移動
    return 'left';
  }
}

function switchToPath(targetPath: string) {
  const current = currentPath();
  const direction = movementDirection(current, targetPath);

  sidebarLayers().forEach((layer) => {
    const layerPath = layer.getAttribute(SIDEBAR_DATA_ATTRS.PATH);
    if (layerPath === targetPath) {
      activateLayer(layer, direction);
    } else {
      deactivateLayer(layer);
    }
  });
}

export function onItemClick(event: Event) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const button = target.closest(`[${SIDEBAR_DATA_ATTRS.TARGET_PATH}]`);

  if (!button) {
    return;
  }

  const path = button.getAttribute(SIDEBAR_DATA_ATTRS.TARGET_PATH)!;
  switchToPath(path);
}
