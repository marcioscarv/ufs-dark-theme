(() => {
  const isSeiAttachment = ['sei.ufs.br', 'www.sei.ufs.br'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('acao') === 'documento_download_anexo';
  if (document.contentType === 'application/pdf' || isSeiAttachment) return;

  const style = document.createElement('style');
  style.id = 'ufs-dark-theme-fallback';
  style.media = 'screen';
  style.textContent = 'html{background:#0b0f14!important;color-scheme:dark!important}body{background:#0b0f14!important;color:#e6edf5!important}';
  document.documentElement.appendChild(style);
})();
