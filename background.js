const THEME_HOSTS = new Set([
  'glpi.ufs.br',
  'www.glpi.ufs.br',
  'polare.ufs.br',
  'www.polare.ufs.br',
  'sso.auth.ufs.br',
  'www.sso.auth.ufs.br',
  'sigrh.ufs.br',
  'www.sigrh.ufs.br',
]);

function isThemePage(url) {
  try {
    return THEME_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isAllowedResource(url) {
  try {
    const resourceURL = new URL(url);
    return ['http:', 'https:'].includes(resourceURL.protocol)
      && (resourceURL.hostname === 'ufs.br' || resourceURL.hostname.endsWith('.ufs.br'));
  } catch {
    return false;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

async function fetchUFSResource(url) {
  const response = await fetch(url, {
    credentials: 'omit',
    redirect: 'follow',
  });
  const buffer = await response.arrayBuffer();

  return {
    success: true,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type') || '',
    body: arrayBufferToBase64(buffer),
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'ufs-dark-fetch') return false;

  const senderURL = sender.url || sender.tab?.url || '';
  if (!isThemePage(senderURL) || !isAllowedResource(message.url)) {
    sendResponse({ success: false, error: 'Recurso não autorizado.' });
    return false;
  }

  fetchUFSResource(message.url)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({ success: false, error: error.message });
    });

  return true;
});
