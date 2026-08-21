const SIGS_STORAGE_KEY = 'sigs_dark';
const SIGS_BASE_CSS = 'styles/sigrh.css';
const SISTEMAS_UFS_HOSTS = new Set(['sistemas.ufs.br', 'www.sistemas.ufs.br']);

const THEMES = Object.freeze({
  'glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'www.glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'polare.ufs.br': { storageKey: 'polare_dark', cssFile: 'styles/polare.css' },
  'www.polare.ufs.br': { storageKey: 'polare_dark', cssFile: 'styles/polare.css' },
  'sso.auth.ufs.br': { storageKey: 'sso_dark', cssFile: 'styles/sso.css' },
  'www.sso.auth.ufs.br': { storageKey: 'sso_dark', cssFile: 'styles/sso.css' },
  'sei.ufs.br': {
    storageKey: 'sei_dark',
    cssFiles: ['styles/sei.css'],
    systemId: 'sei',
  },
  'www.sei.ufs.br': {
    storageKey: 'sei_dark',
    cssFiles: ['styles/sei.css'],
    systemId: 'sei',
  },
  'sigrh.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS],
    systemId: 'sigrh',
  },
  'www.sigrh.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS],
    systemId: 'sigrh',
  },
  'sigaa.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS, 'styles/sigaa.css'],
    systemId: 'sigaa',
  },
  'www.sigaa.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS, 'styles/sigaa.css'],
    systemId: 'sigaa',
  },
  'sipac.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS, 'styles/sipac.css'],
    systemId: 'sipac',
  },
  'www.sipac.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS, 'styles/sipac.css'],
    systemId: 'sipac',
  },
  'resunweb.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: ['styles/resunweb.css'],
    systemId: 'resunweb',
  },
  'www.resunweb.ufs.br': {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: ['styles/resunweb.css'],
    systemId: 'resunweb',
  },
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
function resolveTheme() {
  const currentTheme = THEMES[window.location.hostname];
  if (currentTheme) return currentTheme;

  const isSistemasUFS = SISTEMAS_UFS_HOSTS.has(window.location.hostname);
  if (!isSistemasUFS) return undefined;

  const isSigEleicao = window.location.pathname === '/sigeleicao'
    || window.location.pathname.startsWith('/sigeleicao/');
  const isCxPostal = window.location.pathname === '/cxpostal'
    || window.location.pathname.startsWith('/cxpostal/');

  let systemId = 'sigadmin';
  let systemCSS = 'styles/sigadmin.css';

  if (isSigEleicao) {
    systemId = 'sigeleicao';
    systemCSS = 'styles/sigeleicao.css';
  } else if (isCxPostal) {
    systemId = 'cxpostal';
    systemCSS = 'styles/cxpostal.css';
  }

  return {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [
      SIGS_BASE_CSS,
      systemCSS,
    ],
    systemId,
  };
}

const theme = resolveTheme();

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

function getThemeFiles() {
  return theme.cssFiles || [theme.cssFile];
}

function getThemeURL(cssFile) {
  const url = chrome.runtime.getURL(cssFile);
  return `${url}?v=${encodeURIComponent(EXTENSION_VERSION)}`;
}

function loadThemeCSS() {
  if (!themeCSSPromise) {
    themeCSSPromise = Promise.all(getThemeFiles().map(async (cssFile) => {
      const response = await fetch(getThemeURL(cssFile));
      if (!response.ok) throw new Error(`Não foi possível carregar ${cssFile}.`);
      return response.text();
    })).then((styles) => styles.join('\n\n'));
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
  const isSupportedResource = Boolean(THEMES[resourceURL.hostname])
    || SISTEMAS_UFS_HOSTS.has(resourceURL.hostname);
  if (!isSupportedResource) return new Response('', { status: 200 });

  const credentials = resourceURL.origin === window.location.origin
    ? 'include'
    : 'omit';

  try {
    return await fetch(resourceURL.href, { credentials });
  } catch {
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
  if (document.querySelector('[data-ufs-legacy-theme]')) return;

  getThemeFiles().forEach((cssFile, index) => {
    const link = document.createElement('link');
    link.id = index === 0 ? LEGACY_THEME_LINK_ID : `${LEGACY_THEME_LINK_ID}-${index}`;
    link.dataset.ufsLegacyTheme = 'true';
    link.rel = 'stylesheet';
    link.media = 'screen';
    link.href = getThemeURL(cssFile);
    (document.head || document.documentElement).appendChild(link);
  });
}

function disableLegacyTheme() {
  document.querySelectorAll('[data-ufs-legacy-theme]').forEach((link) => link.remove());
}

function isThemeRendered() {
  return desiredEnabled && (
    dynamicThemeActive
    || Boolean(document.querySelector('[data-ufs-legacy-theme]'))
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

function waitForDocumentBody() {
  if (document.body) return Promise.resolve();

  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', resolve, { once: true });
  });
}

async function enableDynamicTheme(generation) {
  showFallbackStyle();

  try {
    const [dynamicEngine, css] = await Promise.all([
      Promise.resolve(getDynamicEngine()),
      loadThemeCSS(),
    ]);

    await waitForDocumentBody();

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
    const reason = error instanceof Error ? error.message : String(error);
    console.info(`[UFS Dark Theme] CSS legado ativado: ${reason}`);
  }
}

function disableDynamicTheme() {
  try {
    globalThis.UFSDynamicThemeEngine?.disable?.();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.info(`[UFS Dark Theme] Motor já estava indisponível: ${reason}`);
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

function decodeSeiTooltipText(value) {
  return value
    .replace(/\\(['"\\])/g, '$1')
    .replace(/\\[nrt]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSeiProcessSubject(link) {
  const tooltipHandler = link.getAttribute('onmouseover') || '';
  const match = tooltipHandler.match(
    /infraTooltipMostrar\(\s*'((?:\\.|[^'])*)'\s*,\s*'((?:\\.|[^'])*)'\s*\)/,
  );

  if (!match) return null;

  return {
    description: decodeSeiTooltipText(match[1]),
    category: decodeSeiTooltipText(match[2]),
  };
}

function enrichSeiProcessTable(table) {
  const groupedHeader = table.querySelector('tr:first-child > th[colspan="3"]');

  if (groupedHeader && !table.querySelector('.ufs-sei-assunto-header')) {
    const subjectHeader = document.createElement('th');
    subjectHeader.className = `${groupedHeader.className} ufs-sei-assunto-header`.trim();
    subjectHeader.scope = 'col';
    subjectHeader.textContent = 'Assunto';
    groupedHeader.before(subjectHeader);
    groupedHeader.colSpan = 2;
  }

  table.querySelectorAll('tr[id^="P"]').forEach((row) => {
    const processLink = row.querySelector(
      'a.processoVisualizado[onmouseover*="infraTooltipMostrar"]',
    );
    const subjectCell = row.cells[1];
    if (!processLink || !subjectCell) return;

    const subject = getSeiProcessSubject(processLink);
    if (!subject?.category && !subject?.description) return;

    const subjectKey = `${subject.category}\n${subject.description}`;
    if (subjectCell.dataset.ufsSeiSubject === subjectKey) return;

    const content = document.createElement('div');
    content.className = 'ufs-sei-assunto';

    const category = document.createElement('strong');
    category.className = 'ufs-sei-assunto-categoria';
    category.textContent = subject.category || 'Assunto';

    const description = document.createElement('span');
    description.className = 'ufs-sei-assunto-descricao';
    description.textContent = subject.description;

    content.append(category, description);
    subjectCell.replaceChildren(content);
    subjectCell.classList.add('ufs-sei-assunto-cell');
    subjectCell.dataset.ufsSeiSubject = subjectKey;
  });
}

function configureSeiProcessSubjects() {
  if (theme.systemId !== 'sei') return;

  const start = () => {
    let updateQueued = false;
    const update = () => {
      if (updateQueued) return;
      updateQueued = true;
      requestAnimationFrame(() => {
        updateQueued = false;
        document.querySelectorAll('table.tabelaControle').forEach(enrichSeiProcessTable);
      });
    };

    update();
    new MutationObserver(update).observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

if (theme) {
  if (theme.systemId) {
    document.documentElement.dataset.ufsThemeSystem = theme.systemId;
  }
  setThemeEnabled(true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchEditorFrames, { once: true });
  } else {
    watchEditorFrames();
  }

  configurePrintMode();
  configureSeiProcessSubjects();

  const storageKeys = [theme.storageKey];
  if (theme.legacyStorageKey) storageKeys.push(theme.legacyStorageKey);

  chrome.storage.sync.get(storageKeys, (result) => {
    const savedValue = result[theme.storageKey]
      ?? result[theme.legacyStorageKey]
      ?? true;
    setThemeEnabled(savedValue !== false);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync' || !changes[theme.storageKey]) return;
    setThemeEnabled(changes[theme.storageKey].newValue !== false);
  });
}
