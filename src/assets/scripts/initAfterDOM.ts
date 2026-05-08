function initializeCodeBlock() {
  document
    .querySelectorAll<HTMLButtonElement>('.code-block-copy')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn
          .closest('.code-block-wrapper')
          ?.querySelector('code');
        navigator.clipboard.writeText(code?.innerText ?? '').then(() => {
          btn.dataset.copied = 'true';
          setTimeout(() => {
            delete btn.dataset.copied;
          }, 2000);
        });
      });
    });
}

initializeCodeBlock();
