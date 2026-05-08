export function activate(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.dataset.active = 'true';
  }
}

export function deactivate(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.dataset.active = 'false';
  }
}
