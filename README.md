# UFS Dark Theme

Extensão para Google Chrome que aplica um tema escuro aos sistemas institucionais da Universidade Federal de Sergipe (UFS), preservando a identidade visual e melhorando a legibilidade.

## Sistemas compatíveis

- GLPI
- Polare
- SSO
- SIGRH

## Instalação local

1. Baixe ou clone este repositório.
2. Abra `chrome://extensions/` no Google Chrome.
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta do projeto.

O tema de cada sistema pode ser ativado ou desativado pelo painel da extensão.

## Capturas de tela

### GLPI

![Tela de login do GLPI com o tema escuro](docs/screenshots/glpi-login.png)

### SIGRH

![Tela de login do SIGRH com o tema escuro](docs/screenshots/sigrh-login.png)

### Polare — área pública

![Área pública do Polare com o tema escuro](docs/screenshots/polare-publico.png)

## Privacidade

A extensão apenas modifica a apresentação visual das páginas compatíveis. Ela não coleta nem transmite dados pessoais ou de navegação. As preferências de ativação são armazenadas por meio do `chrome.storage.sync`.

Consulte a [política de privacidade](docs/PRIVACY-POLICY.md) para mais detalhes.

## Estrutura

- `manifest.json`: configuração Manifest V3.
- `content.js`: carregamento dos temas.
- `popup.html` e `popup.js`: painel da extensão.
- `styles/`: temas específicos de cada sistema.
- `icons/`: ícones da extensão.
