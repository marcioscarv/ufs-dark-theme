document.addEventListener('DOMContentLoaded', function() {
  const glpiToggle = document.getElementById('glpi_toggle');
  const polareToggle = document.getElementById('polare_toggle');
  const ssoToggle = document.getElementById('sso_toggle');
  const seiToggle = document.getElementById('sei_toggle');
  const sigsToggle = document.getElementById('sigs_toggle');
  chrome.storage.sync.get(['glpi_dark', 'polare_dark', 'sso_dark', 'sei_dark', 'sigs_dark', 'sigrh_dark'], (res) => {
    glpiToggle.checked = res.glpi_dark ?? true;
    polareToggle.checked = res.polare_dark ?? true;
    ssoToggle.checked = res.sso_dark ?? true;
    seiToggle.checked = res.sei_dark ?? true;
    sigsToggle.checked = res.sigs_dark ?? res.sigrh_dark ?? true;
  });


  const handleToggle = (id, storageKey) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', (e) => {
        chrome.storage.sync.set({ [storageKey]: e.target.checked });
      });
    }
  };
  handleToggle('glpi_toggle', 'glpi_dark');
  handleToggle('polare_toggle', 'polare_dark');
  handleToggle('sso_toggle', 'sso_dark');
  handleToggle('sei_toggle', 'sei_dark');
  handleToggle('sigs_toggle', 'sigs_dark');
});
