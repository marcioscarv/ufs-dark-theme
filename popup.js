document.addEventListener('DOMContentLoaded', function() {
  const glpiToggle = document.getElementById('glpi_toggle');
  const polareToggle = document.getElementById('polare_toggle');
  const ssoToggle = document.getElementById('sso_toggle');
  const sigrhToggle = document.getElementById('sigrh_toggle');

  // 1. Recupera o estado salvo de todos os sistemas
  // Usamos o operador ?? true para que, na primeira instalação, todos venham ativados
  chrome.storage.sync.get(['glpi_dark', 'polare_dark', 'sso_dark', 'sigrh_dark'], (res) => {
    glpiToggle.checked = res.glpi_dark ?? true;
    polareToggle.checked = res.polare_dark ?? true;
    ssoToggle.checked = res.sso_dark ?? true;
    sigrhToggle.checked = res.sigrh_dark ?? true;
  });

  /**
   * 2. Função para salvar a preferência
   * @param {string} id - O ID do elemento checkbox no HTML
   * @param {string} storageKey - A chave que será salva no Chrome Storage
   */
  const handleToggle = (id, storageKey) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', (e) => {
        // O content script aplica a mudança em tempo real; não é preciso
        // recarregar a página nem solicitar acesso extra às abas.
        chrome.storage.sync.set({ [storageKey]: e.target.checked });
      });
    }
  };

  // 3. Inicializa os ouvintes para cada switch
  handleToggle('glpi_toggle', 'glpi_dark');
  handleToggle('polare_toggle', 'polare_dark');
  handleToggle('sso_toggle', 'sso_dark');
  handleToggle('sigrh_toggle', 'sigrh_dark');
});
