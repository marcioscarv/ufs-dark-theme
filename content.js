const SIGS_STORAGE_KEY = 'sigs_dark';
const SIGS_BASE_CSS = 'styles/sigrh.css';
const SISTEMAS_UFS_HOSTS = new Set(['sistemas.ufs.br', 'www.sistemas.ufs.br']);

const THEMES = Object.freeze({
  'glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'www.glpi.ufs.br': { storageKey: 'glpi_dark', cssFile: 'styles/glpi.css' },
  'redmine.ufs.br': { storageKey: 'redmine_dark', cssFile: 'styles/redmine.css' },
  'www.redmine.ufs.br': { storageKey: 'redmine_dark', cssFile: 'styles/redmine.css' },
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

const SIG_ROUTE_HOSTS = new Set([
  'sigrh.ufs.br',
  'www.sigrh.ufs.br',
  'sigaa.ufs.br',
  'www.sigaa.ufs.br',
  'sipac.ufs.br',
  'www.sipac.ufs.br',
  'resunweb.ufs.br',
  'www.resunweb.ufs.br',
  'sistemas.ufs.br',
  'www.sistemas.ufs.br',
]);

const SIG_ROUTE_THEMES = Object.freeze({
  sigrh: { cssFiles: [SIGS_BASE_CSS], systemId: 'sigrh' },
  sigaa: { cssFiles: [SIGS_BASE_CSS, 'styles/sigaa.css'], systemId: 'sigaa' },
  sipac: { cssFiles: [SIGS_BASE_CSS, 'styles/sipac.css'], systemId: 'sipac' },
  sigadmin: { cssFiles: [SIGS_BASE_CSS, 'styles/sigadmin.css'], systemId: 'sigadmin' },
  sigeleicao: {
    cssFiles: [SIGS_BASE_CSS, 'styles/sigeleicao.css'],
    systemId: 'sigeleicao',
  },
  cxpostal: { cssFiles: [SIGS_BASE_CSS, 'styles/cxpostal.css'], systemId: 'cxpostal' },
  resunweb: { cssFiles: ['styles/resunweb.css'], systemId: 'resunweb' },
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

function resolveRoutedSigTheme() {
  if (!SIG_ROUTE_HOSTS.has(window.location.hostname)) return undefined;

  const route = window.location.pathname.split('/').find(Boolean)?.toLowerCase();
  const routeTheme = SIG_ROUTE_THEMES[route];
  if (!routeTheme) return undefined;

  return {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    ...routeTheme,
  };
}

function resolveTheme() {
  const routedTheme = resolveRoutedSigTheme();
  if (routedTheme) return routedTheme;

  const currentTheme = THEMES[window.location.hostname];
  if (currentTheme) return currentTheme;

  const isSistemasUFS = SISTEMAS_UFS_HOSTS.has(window.location.hostname);
  if (!isSistemasUFS) return undefined;

  return {
    storageKey: SIGS_STORAGE_KEY,
    legacyStorageKey: 'sigrh_dark',
    cssFiles: [SIGS_BASE_CSS, 'styles/sigadmin.css'],
    systemId: 'sigadmin',
  };
}

const isSeiAttachment = ['sei.ufs.br', 'www.sei.ufs.br'].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get('acao') === 'documento_download_anexo';
const theme = document.contentType === 'application/pdf' || isSeiAttachment
  ? undefined
  : resolveTheme();

let activationGeneration = 0;
let desiredEnabled = false;
let dynamicThemeActive = false;
let syncRedmineBoardStickyHeader = () => {};
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
  syncRedmineBoardStickyHeader();

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

function configureRedmineBoardPanning() {
  if (theme.storageKey !== 'redmine_dark') return;

  let activePan = null;

  const finishPan = () => {
    if (!activePan) return;
    activePan.board.classList.remove('ufs-redmine-panning');
    try {
      activePan.board.releasePointerCapture(activePan.pointerId);
    } catch {
    }
    activePan = null;
  };

  document.addEventListener('pointerdown', (event) => {
    if (!desiredEnabled || event.button !== 0 || event.pointerType !== 'mouse') return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const board = target.closest('.agile-board.autoscroll');
    if (!board || board.scrollWidth <= board.clientWidth + 1) return;
    if (target.closest('.issue-card, a, button, input, select, textarea, label, [contenteditable], .add-issue')) return;

    const onColumn = target.closest('table.issues-board th, td.issue-status-col');
    if (!onColumn && target !== board && !target.classList.contains('container-fixed')) return;

    activePan = {
      board,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: board.scrollLeft,
    };
    board.classList.add('ufs-redmine-panning');
    board.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  document.addEventListener('pointermove', (event) => {
    if (!activePan || event.pointerId !== activePan.pointerId) return;
    if (!desiredEnabled) {
      finishPan();
      return;
    }
    activePan.board.scrollLeft = activePan.startScrollLeft - (event.clientX - activePan.startX);
    event.preventDefault();
  });

  document.addEventListener('pointerup', (event) => {
    if (activePan && event.pointerId === activePan.pointerId) finishPan();
  });
  document.addEventListener('pointercancel', finishPan);
  window.addEventListener('blur', finishPan);
}

function configureRedmineBoardStickyHeader() {
  if (theme.storageKey !== 'redmine_dark') return;

  const sync = () => {
    document.querySelectorAll('.agile-board.autoscroll').forEach((board) => {
      const header = board.querySelector('table.issues-board.sticky');
      if (!header) return;

      if (!desiredEnabled) {
        header.style.removeProperty('transform');
        header.style.removeProperty('clip-path');
        header.classList.remove('ufs-redmine-header-synced');
        return;
      }

      const scrollLeft = board.scrollLeft;
      const table = board.querySelector('table.issues-board:not(.sticky)');
      const tableWidth = table?.offsetWidth || header.offsetWidth;
      const hiddenRight = Math.max(0, tableWidth - scrollLeft - board.clientWidth);
      header.style.transform = `translateX(${-scrollLeft}px)`;
      header.style.clipPath = `inset(0 ${hiddenRight}px 0 ${scrollLeft}px)`;
      header.classList.add('ufs-redmine-header-synced');
    });
  };

  syncRedmineBoardStickyHeader = sync;

  document.addEventListener('scroll', sync, true);
  window.addEventListener('resize', sync);
  window.addEventListener('load', sync);
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  sync();
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
  configureRedmineBoardPanning();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configureRedmineBoardStickyHeader, { once: true });
  } else {
    configureRedmineBoardStickyHeader();
  }
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
