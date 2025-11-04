export const SIDEBAR_ID = 'sidebar';

export const SIDEBAR_DATA_ATTRS = {
  TAG: 'data-tag',
  CURRENT_TAG: 'data-current-tag',
  TARGET_TAG: 'data-target-tag',
  ACTIVE: 'data-active',
  SLIDE_DIRECTION: 'data-slide-direction',
};

function sidebarElement() {
  return document.getElementById(SIDEBAR_ID);
}

function sidebarLayers() {
  const sidebar = sidebarElement();

  return sidebar ? sidebar.querySelectorAll(`[${SIDEBAR_DATA_ATTRS.TAG}]`) : [];
}

function currentTag() {
  return sidebarElement()?.getAttribute(SIDEBAR_DATA_ATTRS.CURRENT_TAG) || '';
}

function activateLayer(layer: Element, direction: 'left' | 'right') {
  layer.setAttribute(SIDEBAR_DATA_ATTRS.ACTIVE, 'true');
  layer.setAttribute(SIDEBAR_DATA_ATTRS.SLIDE_DIRECTION, direction);

  const resetAnimation = () => {
    layer.removeAttribute(SIDEBAR_DATA_ATTRS.SLIDE_DIRECTION);
    layer.removeEventListener('animationend', resetAnimation);
  };

  layer.addEventListener('animationend', resetAnimation);
  sidebarElement()?.setAttribute(SIDEBAR_DATA_ATTRS.CURRENT_TAG, layer.getAttribute(SIDEBAR_DATA_ATTRS.TAG) || '');
}

function deactivateLayer(layer: Element) {
  layer.setAttribute(SIDEBAR_DATA_ATTRS.ACTIVE, 'false');
}

function movementDirection(currentTag: string, targetTag: string): 'left' | 'right' {
  if (currentTag.startsWith(targetTag + '/')) {
    // 親タグへ移動
    return 'right';
  } else {
    // 子タグへ移動
    return 'left';
  }
}

function switchToTag(targetTag: string) {
  const current = currentTag();
  const direction = movementDirection(current, targetTag);

  sidebarLayers().forEach((layer) => {
    const layerTag = layer.getAttribute(SIDEBAR_DATA_ATTRS.TAG);
    if (layerTag === targetTag) {
      activateLayer(layer, direction);
    } else {
      deactivateLayer(layer);
    }
  });
}

export function onItemClick(event: Event) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const button = target.closest(`[${SIDEBAR_DATA_ATTRS.TARGET_TAG}]`);

  if (!button) {
    return;
  }

  const tag = button.getAttribute(SIDEBAR_DATA_ATTRS.TARGET_TAG)!;
  switchToTag(tag);
}
