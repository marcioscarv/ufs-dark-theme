(() => {
  const style = document.createElement('style');
  style.id = 'ufs-dark-theme-fallback';
  style.media = 'screen';
  style.textContent = 'html{background:#0b0f14!important;color-scheme:dark!important}body{background:#0b0f14!important;color:#e6edf5!important}';
  document.documentElement.appendChild(style);
})();
