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

const DYNAMIC_THEME = Object.freeze({
  mode: 1,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  darkSchemeBackgroundColor: '#0b0f14',
  darkSchemeTextColor: '#e6edf5',
  scrollbarColor: 'auto',
  selectionColor: 'auto',
  styleSystemControls: true,
});

const LEGACY_THEME_LINK_ID = 'ufs-dark-theme';
const FALLBACK_STYLE_ID = 'ufs-dark-theme-fallback';
const EDITOR_STYLE_ID = 'ufs-dark-editor-theme';
const EXTENSION_VERSION = chrome.runtime.getManifest().version;
const theme = THEMES[window.location.hostname];

let activationGeneration = 0;
let desiredEnabled = false;
let dynamicThemeActive = false;
let editorSyncQueued = false;
let themeCSSPromise;
let restoreThemeAfterPrint = false;

function getDynamicEngine() {
  const dynamicEngine = globalThis.UFSDynamicThemeEngine;
  if (!dynamicEngine || typeof dynamicEngine.enable !== 'function') {
    throw new Error('O motor dinâmico não foi carregado.');
  }
  return dynamicEngine;
}

function getThemeURL() {
  const url = chrome.runtime.getURL(theme.cssFile);
  return `${url}?v=${encodeURIComponent(EXTENSION_VERSION)}`;
}

function loadThemeCSS() {
  if (!themeCSSPromise) {
    themeCSSPromise = fetch(getThemeURL()).then((response) => {
      if (!response.ok) {
        throw new Error(`Não foi possível carregar ${theme.cssFile}.`);
      }
      return response.text();
    });
  }
  return themeCSSPromise;
}

function createDynamicFixes(css) {
  return {
    invert: [],
    css,
    ignoreInlineStyle: [],
    ignoreImageAnalysis: [],
    disableStyleSheetsProxy: false,
    ignoreCSSUrl: [],
  };
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function fetchThroughExtension(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'ufs-dark-fetch', url }, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!result?.success) {
        reject(new Error(result?.error || 'Falha ao buscar recurso da UFS.'));
        return;
      }

      const headers = result.contentType
        ? { 'content-type': result.contentType }
        : undefined;
      resolve(new Response(base64ToBytes(result.body), {
        status: result.status,
        statusText: result.statusText,
        headers,
      }));
    });
  });
}

async function fetchForDynamicEngine(url) {
  const resourceURL = new URL(url, window.location.href);
  const credentials = resourceURL.origin === window.location.origin
    ? 'include'
    : 'omit';

  try {
    return await fetch(resourceURL.href, { credentials });
  } catch (error) {
    const isUFSResource = resourceURL.hostname === 'ufs.br'
      || resourceURL.hostname.endsWith('.ufs.br');
    if (!isUFSResource) throw error;
    return fetchThroughExtension(resourceURL.href);
  }
}

function showFallbackStyle() {
  if (document.getElementById(FALLBACK_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = FALLBACK_STYLE_ID;
  style.media = 'screen';
  style.textContent = `
    html {
      background: #0b0f14 !important;
      color-scheme: dark !important;
    }
    body {
      background: #0b0f14 !important;
      color: #e6edf5 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function removeFallbackStyle() {
  document.getElementById(FALLBACK_STYLE_ID)?.remove();
}

function enableLegacyTheme() {
  let link = document.getElementById(LEGACY_THEME_LINK_ID);
  if (link) return;

  link = document.createElement('link');
  link.id = LEGACY_THEME_LINK_ID;
  link.rel = 'stylesheet';
  link.media = 'screen';
  link.href = getThemeURL();
  (document.head || document.documentElement).appendChild(link);
}

function disableLegacyTheme() {
  document.getElementById(LEGACY_THEME_LINK_ID)?.remove();
}

function isThemeRendered() {
  return desiredEnabled && (
    dynamicThemeActive
    || Boolean(document.getElementById(LEGACY_THEME_LINK_ID))
  );
}

function syncEditorFrames(isEnabled) {
  document.querySelectorAll('iframe[id$="_ifr"]').forEach((frame) => {
    const applyTheme = () => {
      try {
        const frameDocument = frame.contentDocument;
        if (!frameDocument?.head) return;

        const currentStyle = frameDocument.getElementById(EDITOR_STYLE_ID);
        if (!isEnabled) {
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
        style.media = 'screen';
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
        // Editores de outra origem não permitem acesso ao documento interno.
      }
    };

    applyTheme();
    if (!frame.dataset.ufsThemeListener) {
      frame.dataset.ufsThemeListener = 'true';
      frame.addEventListener('load', () => applyTheme());
    }
  });
}

function queueEditorFrameSync() {
  if (editorSyncQueued) return;
  editorSyncQueued = true;
  requestAnimationFrame(() => {
    editorSyncQueued = false;
    syncEditorFrames(isThemeRendered());
  });
}

async function enableDynamicTheme(generation) {
  showFallbackStyle();

  try {
    const [dynamicEngine, css] = await Promise.all([
      Promise.resolve(getDynamicEngine()),
      loadThemeCSS(),
    ]);

    if (!desiredEnabled || generation !== activationGeneration) return;

    dynamicEngine.setFetchMethod(fetchForDynamicEngine);
    dynamicEngine.enable(DYNAMIC_THEME, createDynamicFixes(css));
    dynamicThemeActive = true;
    disableLegacyTheme();
    removeFallbackStyle();
    queueEditorFrameSync();
  } catch (error) {
    if (!desiredEnabled || generation !== activationGeneration) return;

    dynamicThemeActive = false;
    enableLegacyTheme();
    removeFallbackStyle();
    queueEditorFrameSync();
    console.warn('[UFS Dark Theme] Motor dinâmico indisponível; usando CSS legado.', error);
  }
}

function disableDynamicTheme() {
  try {
    globalThis.UFSDynamicThemeEngine?.disable?.();
  } catch (error) {
    console.warn('[UFS Dark Theme] Não foi possível desativar o motor dinâmico.', error);
  }
  dynamicThemeActive = false;
}

function setThemeEnabled(isEnabled) {
  desiredEnabled = isEnabled;
  const generation = ++activationGeneration;

  if (!isEnabled) {
    disableDynamicTheme();
    disableLegacyTheme();
    removeFallbackStyle();
    syncEditorFrames(false);
    return;
  }

  if (dynamicThemeActive) {
    queueEditorFrameSync();
    return;
  }

  enableDynamicTheme(generation);
}

function watchEditorFrames() {
  queueEditorFrameSync();
  if (!document.body) return;

  new MutationObserver(queueEditorFrameSync).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function configurePrintMode() {
  window.addEventListener('beforeprint', () => {
    restoreThemeAfterPrint = desiredEnabled;
    if (restoreThemeAfterPrint) setThemeEnabled(false);
  });

  window.addEventListener('afterprint', () => {
    if (!restoreThemeAfterPrint) return;
    restoreThemeAfterPrint = false;
    setThemeEnabled(true);
  });
}

if (theme) {
  // O tema permanece ativo por padrão. O estilo mínimo evita o clarão branco
  // enquanto o CSS de correções e a preferência sincronizada são carregados.
  setThemeEnabled(true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchEditorFrames, { once: true });
  } else {
    watchEditorFrames();
  }

  configurePrintMode();

  chrome.storage.sync.get(theme.storageKey, (result) => {
    setThemeEnabled(result[theme.storageKey] !== false);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync' || !changes[theme.storageKey]) return;
    setThemeEnabled(changes[theme.storageKey].newValue !== false);
  });
}
