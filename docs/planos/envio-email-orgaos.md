# Envio das planilhas de manifestação por e-mail, por órgão

## Contexto

Hoje a rodada de manifestação (`gerarRodada`, `index.html:7150`) gera uma planilha protegida por órgão
(`montarPlanilhaOrgao`, `:7199`) e baixa tudo num ZIP; o envio aos órgãos é manual.
O usuário quer um **botão que envie, a cada órgão, a sua planilha anexa**, para **um ou mais e-mails
cadastrados por órgão**, **sem depender da TI da SEPLAG**. O e-mail institucional é **Google Workspace**.
O cadastro vem de um **.xlsx obrigatório**, criticado pelo sistema antes do envio, e **os envios ficam
registrados no .json da sessão**.

Restrição de arquitetura: o sistema é uma página estática (GitHub Pages, `marceloclr.github.io/saneamento`),
sem servidor. Um navegador não fala SMTP; é preciso uma API de envio.

## O que é necessário — infraestrutura

**Solução recomendada: API do Gmail chamada direto do navegador (Google Identity Services, OAuth).**
Nenhum servidor, nenhuma senha guardada, custo zero. O e-mail sai da conta Google de quem clica,
aparece em “Enviados” e as respostas dos órgãos voltam para a caixa dele.

**Desenvolvimento com conta Gmail pessoal, migração depois para a SEPLAG — sim, funciona.**
O código é o mesmo; o que muda é só o **Client ID** colado em Configurações (e o remetente).
- Fase de testes (conta pessoal): projeto no Cloud da conta pessoal, consentimento **Externo**, status
  **Em teste**, com a própria conta (e outras de teste) em “Usuários de teste”. O Google mostra o aviso
  “app não verificado” → *Avançado → continuar*; não precisa de verificação enquanto for teste
  (até 100 usuários de teste). Limite do Gmail pessoal: ~500 destinatários/dia — suficiente para testes.
- Nos testes, o cadastro aponta **só para e-mails próprios/de teste**; planilhas reais não saem da conta
  pessoal para os órgãos.
- Migração: repetir os passos abaixo com a conta da SEPLAG (consentimento **Interno**), colar o novo
  Client ID em Configurações. Nada no código muda; sessões e cadastros continuam válidos.

Configuração única (≈ 20 min, sem TI) — na conta pessoal para testes, depois na conta da SEPLAG:

1. `console.cloud.google.com` → criar projeto (ex.: `saneamento-mapps`).
2. Ativar a **Gmail API**.
3. Tela de consentimento OAuth → tipo **Interno** (só contas do domínio; dispensa verificação do Google).
   Escopo: `https://www.googleapis.com/auth/gmail.send` (só enviar; não lê a caixa).
4. Credenciais → **ID do cliente OAuth – Aplicativo da Web**, origens JavaScript autorizadas:
   `https://marceloclr.github.io` e `http://127.0.0.1:8765` (testes locais).
5. Copiar o **Client ID** (é público, não é segredo) e colar em Configurações do sistema.

**Riscos (a checar no passo 0, antes de programar):** o administrador do Workspace pode ter bloqueado
a criação de projetos no Cloud ou o acesso de apps à API do Gmail. Se o passo 0 falhar:
- alternativa A: projeto criado numa conta Google pessoal, consentimento **Externo em modo de teste**,
  com o e-mail da SEPLAG como usuário de teste (funciona se o domínio não bloquear apps não verificados);
- alternativa B (sem API): gerar um **.eml por órgão** (destinatários, assunto, corpo e anexo prontos)
  para abrir e enviar no cliente de e-mail — um clique por órgão, sem configuração.

Limites do Gmail (Workspace): 2.000 mensagens/dia, 10.000 destinatários/dia, 25 MB por mensagem —
folgados para ~60 órgãos com planilhas de poucas centenas de KB. Envio sequencial com pequena pausa
e nova tentativa em erro 429/5xx.

## O que é necessário — sistema (`index.html`, bloco 11 “Manifestação e sessão”)

### 1. Cadastro de destinatários (upload obrigatório)
- Na aba Manifestação, bloco **“Destinatários por órgão”** com upload de .xlsx (leitura com `XLSX.read`,
  como em `selecionarArquivo`) e botão **Baixar modelo**.
- Formato do modelo, aba `DESTINATARIOS`: `ÓRGÃO` · `NOME` · `E-MAIL` · `TIPO` (`Para`/`Cc`, padrão `Para`).
  Uma linha por pessoa; vários e-mails por órgão = várias linhas.
- **Crítica antes de liberar o envio** (tela com erros e avisos; erro bloqueia):
  - erro: aba/colunas ausentes; e-mail vazio ou fora do padrão; TIPO inválido; linha duplicada;
    órgão da rodada **sem nenhum e-mail `Para`**;
  - aviso: órgão do cadastro que não existe na base (grafia — sugerir o mais parecido, comparando com
    `norm()`); órgão com muitos destinatários; domínio fora de `*.gov.br`/`*.ce.gov.br`.
- Casamento órgão ↔ cadastro pela mesma normalização usada no sistema (`norm`).
- Cadastro vai para `E.destinatarios` = `{ arquivo, carregadoEm, hash, linhas:[{orgao,nome,email,tipo}] }`.

### 2. Conexão com o Google
- Configurações: campo **Client ID do Google**; guardado no `localStorage` (é público) e no .json da sessão.
- Carregar `https://accounts.google.com/gsi/client` (script do Google; exceção à regra de CDN única).
- `google.accounts.oauth2.initTokenClient({client_id, scope:'…/gmail.send'})` → token de 1 h só em memória
  (nunca no .json, mesma política do token do GitHub, `githubGravar` `:7051`).
- Mostrar a conta conectada (remetente) antes de enviar.

### 3. Envio
- Na tabela de rodadas (`renderManifestacoes`, `:7433`), ao lado de **Baixar de novo**: **Enviar por e-mail**
  (rodada inteira) e por órgão; também **Reenviar só as falhas**.
- Planilhas: reaproveitar `reemitirRodada` (`:7288`) extraindo a parte que monta os buffers
  (`montarPlanilhaOrgao` com os tokens gravados) numa função `planilhasDaRodada(r, idx)` usada pelo
  download e pelo envio — a planilha enviada é idêntica à baixada.
- Mensagem MIME multipart montada no navegador (texto + anexo .xlsx em base64), `POST
  https://gmail.googleapis.com/gmail/v1/users/me/messages/send` com `{raw}` em base64url.
- Assunto e corpo com modelo editável (campos: órgão, nº de MAPPs, prazo/data-limite da rodada, id da rodada);
  pré-visualização da primeira mensagem e confirmação (`perguntar`) com totais: N órgãos, M destinatários.
- Painel de processamento existente (`iniciarProcesso`/`fase`/`progressoFase`) com andamento por órgão.

### 4. Registro na sessão (.json)
- Em cada `rodada.orgaos[k]`, novo vetor `emails:[{ em, remetente, para:[], cc:[], assunto, arquivo,
  hashPlanilha, idMensagem, idConversa, situacao:'enviado'|'falha', erro }]`.
- Em `montarSessao` (`:6863`): gravar `destinatarios` (o cadastro vigente, com hash); `aplicarSessao`
  (`:6971`) aceita sessões sem esses campos (compatível com as atuais).
- Após o lote, `gravarSessao()` automaticamente, como já faz `gerarRodada` (`:7196`).
- Situação por órgão na tela: “enviado em dd/mm hh:mm para …”, “falha: …”, “não enviado”.
- Exportação `manifestacoes` (`exportarManifestacoes`, `:7490`) ganha colunas de envio.

### 5. Documentação
- `manual.html`: passo “Enviar as planilhas por e-mail” e anexo “Configurar o Google (uma vez)”.
- `README.md`: corrigir “nenhum dado é enviado a servidores” → só as planilhas, ao Gmail, por ação explícita.
- `02-arquitetura-do-codigo.md` e `03-backlog.md`.

## Etapas (um commit por etapa, relatório ao fim de cada uma)

0. **Configuração de teste (usuário, sem código):** projeto + Client ID na conta Gmail pessoal (Externo, em teste).
   Em paralelo, testar se a conta da SEPLAG consegue criar projeto no Cloud; se bloqueada, decidir entre A e B
   antes da etapa final.
1. Cadastro: modelo, upload, crítica e tela de erros/avisos + registro em `E.destinatarios`/sessão.
2. Refatorar `reemitirRodada` → `planilhasDaRodada` (sem mudar o download).
3. Conexão Google + montagem MIME + envio de um órgão (teste para o próprio e-mail).
4. Envio em lote, modelos de assunto/corpo, pré-visualização, reenvio de falhas, registro no .json.
5. Manual, README, arquitetura, backlog.
6. **Migração para a SEPLAG:** Client ID corporativo em Configurações e ensaio real com a conta institucional.

## Verificação

- Teste jsdom (`testes/`, padrão de `carregar.js`): crítica do cadastro com planilhas de erro
  (coluna faltando, e-mail inválido, órgão sem e-mail, órgão inexistente) — conferir erros/avisos.
- Teste jsdom da montagem MIME: decodificar o `raw` e conferir destinatários, assunto e que o anexo
  é byte a byte a planilha de `planilhasDaRodada`.
- Teste jsdom da sessão: gravar → reaplicar → `emails` e `destinatarios` preservados; sessão antiga abre.
- Ensaio real: cadastro com o próprio e-mail do usuário em 2–3 órgãos, envio pelo site publicado,
  conferir “Enviados”, abrir o anexo, importar de volta como retorno (`importarRetornos`) e ver o
  registro no .json.
