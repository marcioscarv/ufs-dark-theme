# UFS Dark Theme — informações para a Chrome Web Store

## Propósito único

Aplicar um tema escuro aos sistemas institucionais GLPI, Polare, Portal de
Autenticação (SSO), SEI e à família SIGs da Universidade Federal de Sergipe,
melhorando o conforto visual sem alterar as funcionalidades desses sistemas.

## Descrição curta

Tema escuro para GLPI, Polare, SSO, SEI, SIGAA, SIPAC, SIGRH, SIGADMIN, SIGEleição,
RESUNWEB e Caixa Postal da UFS.

## Descrição detalhada sugerida

O UFS Dark Theme adapta a aparência dos sistemas institucionais da Universidade
Federal de Sergipe para uma paleta escura e de maior conforto visual.

A extensão atua exclusivamente no GLPI, Polare, Portal de Autenticação (SSO), SEI e
na família SIGs da UFS: SIGAA, SIPAC, SIGRH, SIGADMIN, SIGEleição, RESUNWEB e
Caixa Postal. GLPI, Polare, SSO e SEI possuem controles próprios; os SIGs
compartilham um único controle. O tema preserva a estrutura e as
funcionalidades originais das páginas e não adiciona publicidade.

A extensão não coleta, registra, vende ou transmite dados pessoais, conteúdo
das páginas, credenciais, formulários ou histórico de navegação.

## Justificativa da permissão `storage`

A permissão `storage` é utilizada somente para salvar cinco preferências de
ativação do tema (`glpi_dark`, `polare_dark`, `sso_dark`, `sei_dark` e `sigs_dark`). Esses
valores são booleanos e permitem manter a escolha do usuário entre sessões e,
quando o Chrome Sync estiver ativo, entre seus próprios dispositivos. O
desenvolvedor não recebe nem acessa essas preferências.

## Justificativa de acesso aos sites

O acesso é limitado aos domínios institucionais declarados no manifesto. Ele é
necessário para inserir os arquivos CSS locais que aplicam o modo escuro e para
ajustar visualmente componentes criados dinamicamente pelas próprias páginas.
A extensão não registra URLs visitadas, não lê credenciais ou formulários e não
transmite conteúdo desses sites.

## Código remoto

Não. Todo o JavaScript e CSS executado pela extensão está incluído no pacote.
A extensão não baixa nem executa código remoto. Ela pode solicitar novamente
folhas de estilo e imagens já referenciadas pelas páginas, exclusivamente nos
domínios dos sistemas suportados, para calcular a apresentação visual.

## Declaração de uso de dados

A extensão não coleta nem transmite dados pessoais ou sensíveis, atividade de
navegação, conteúdo de sites, informações de autenticação, comunicações,
localização ou dados financeiros. Ela acessa somente a estrutura visual das
páginas nos domínios autorizados para aplicar estilos locais.

## Certificação de uso limitado

As permissões e o acesso aos sites são usados exclusivamente para o propósito
único declarado: aplicar o tema escuro. Nenhuma informação é usada para
publicidade, análise comportamental, criação de perfil, venda ou transferência
a terceiros.

## Checklist do painel

- Manifest V3: sim.
- Código remoto: não.
- Coleta de dados: não.
- Permissão `storage`: salvar preferências de ativação do tema.
- Acesso aos sites: aplicar CSS somente nos sistemas institucionais suportados.
- Publicidade: não.
- Venda ou compartilhamento de dados: não.
