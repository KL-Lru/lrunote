import { applyTheme, getTheme, setTheme, useSystem } from '@/utils/theme';

function observeSystemTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  mq.addEventListener('change', () => {
    if (useSystem()) {
      applyTheme('system');
    }
  });
}

function init() {
  setTheme(getTheme());
  observeSystemTheme();
}

init();
