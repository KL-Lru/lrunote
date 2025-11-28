type Theme = 'light' | 'dark' | 'system';

export const DEFAULT_THEME: Theme = 'system';
export const THEME_KEY = 'theme';

export function useSystem() {
  return localStorage.getItem(THEME_KEY) === 'system' || !localStorage.getItem(THEME_KEY);
}

export function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function systemLight() {
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

export function systemTheme() {
  if (systemDark()) return 'dark';
  if (systemLight()) return 'light';

  return DEFAULT_THEME;
}

export function getTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return 'system';
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);

  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement;
  const currentTheme = theme === 'system' ? systemTheme() : theme;

  html.classList.remove('light', 'dark');
  html.classList.add(currentTheme);
}
