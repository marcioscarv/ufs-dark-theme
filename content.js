const THEMES = Object.freeze({
  'glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'www.glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'polare.ufs.br': { storageKey: 'polare_dark', cssFile: 'styles/polare.css' },
  'www.polare.ufs.br': { storageKey: 'polare_dark', cssFile: 'styles/polare.css' },
  'sso.auth.ufs.br': { storageKey: 'sso_dark', cssFile: 'styles/sso.css' },
  'www.sso.auth.ufs.br': { storageKey: 'sso_dark', cssFile: 'styles/sso.css' },
  'sigrh.ufs.br': { storageKey: 'sigrh_dark', cssFile: 'styles/sigrh.css' },
  'www.sigrh.ufs.br': { storageKey: 'sigrh_dark', cssFile: 'styles/sigrh.css' },
});

const THEME_LINK_ID = 'ufs-dark-theme';
const EDITOR_STYLE_ID = 'ufs-dark-editor-theme';
const EXTENSION_VERSION = chrome.runtime.getManifest().version;
const GLPI_PRINT_PATHS = new Set([
  '/plugins/os/front/os.php',
  '/plugins/os/front/os_cli.php',
]);

const theme = THEMES[window.location.hostname];
const isGlpi = window.location.hostname === 'glpi.ufs.br'
  || window.location.hostname === 'www.glpi.ufs.br';
const isGlpiPrintPage = isGlpi && GLPI_PRINT_PATHS.has(window.location.pathname);

function syncEditorFrames(isEnabled) {
  document.querySelectorAll('iframe[id$="_ifr"]').forEach((frame) => {
    const applyTheme = () => {
      try {
        const frameDocument = frame.contentDocument;
        if (!frameDocument?.head) return;

        const currentStyle = frameDocument.getElementById(EDITOR_STYLE_ID);
        const shouldEnable = isEnabled
          && Boolean(document.getElementById(THEME_LINK_ID));
        if (!shouldEnable) {
          currentStyle?.remove();
          frame.classList.remove('ufs-editor-ready');
          return;
        }

        if (currentStyle) {
          frame.classList.add('ufs-editor-ready');
          return;
        }

        const style = frameDocument.createElement('style');
        style.id = EDITOR_STYLE_ID;
        style.textContent = `
          html, body {
            background: #0b0f14 !important;
            color: #e6edf5 !important;
            color-scheme: dark;
          }
          body { padding: 8px !important; }
          a { color: #69a7ff !important; }
        `;
        frameDocument.head.appendChild(style);
        frame.classList.add('ufs-editor-ready');
      } catch {
        // Alguns editores podem usar frames de outra origem.
      }
    };

    applyTheme();
    if (!frame.dataset.ufsThemeListener) {
      frame.dataset.ufsThemeListener = 'true';
      frame.addEventListener('load', () => {
        applyTheme();
      });
    }
  });
}

function setThemeEnabled(isEnabled) {
  const currentLink = document.getElementById(THEME_LINK_ID);

  if (!isEnabled) {
    currentLink?.remove();
    syncEditorFrames(false);
    return;
  }

  if (currentLink) {
    syncEditorFrames(true);
    return;
  }

  const link = document.createElement('link');
  link.id = THEME_LINK_ID;
  link.rel = 'stylesheet';
  link.href = `${chrome.runtime.getURL(theme.cssFile)}?v=${encodeURIComponent(EXTENSION_VERSION)}`;
  (document.head || document.documentElement).appendChild(link);
  syncEditorFrames(true);
}

function keepThemeAfterPageStyles() {
  const link = document.getElementById(THEME_LINK_ID);
  if (link && document.head) document.head.appendChild(link);
}

if (theme && !isGlpiPrintPage) {
  // O tema é ativo por padrão. A injeção imediata reduz o clarão branco
  // enquanto a preferência sincronizada é consultada.
  setThemeEnabled(true);

  // O GLPI adiciona folhas próprias depois do início do documento. Mover o
  // tema para o fim do <head> preserva o dark mode sem aumentar especificidade.
  document.addEventListener('DOMContentLoaded', keepThemeAfterPageStyles, {
    once: true,
  });

  document.addEventListener('DOMContentLoaded', () => {
    syncEditorFrames(Boolean(document.getElementById(THEME_LINK_ID)));
    new MutationObserver(() => {
      syncEditorFrames(Boolean(document.getElementById(THEME_LINK_ID)));
    }).observe(document.body, { childList: true, subtree: true });
  }, { once: true });

  chrome.storage.sync.get(theme.storageKey, (result) => {
    setThemeEnabled(result[theme.storageKey] !== false);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync' || !changes[theme.storageKey]) return;
    setThemeEnabled(changes[theme.storageKey].newValue !== false);
  });
}
