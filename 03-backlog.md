# Backlog

## Lote de 30/09/2026 — Contratos de Gestão (C.G.)

Plano: [`docs/planos/contratos-de-gestao.md`](docs/planos/contratos-de-gestao.md).
- Versão completa: varredura do título de **todos os MAPPs** por “Contrato(s) de Gestão” ou pela
  sigla C.G. (C.G, CG, C.G.), feita no `diagnosticar`, logo depois das Regras 1 a 4 — 42 MAPPs de
  12 órgãos na base de 18/09.
- Tela **Análise › Contratos de Gestão (C.G.)**: cartões, grade com origem (automática ou manual) e
  situação no saneamento, **Remover marcação**, **Marcar MAPP como C.G.** (busca por palavras entre
  os não marcados) e **Marcações automáticas removidas**, com **Restaurar**.
- Marcação informativa, em `E.cg` e na sessão (`cg`); não muda regra, exclusão, sobrevivência
  nem Novo Programado 2027.
- Exportação: aba **CONTRATOS DE GESTAO** em Exportar resultado — Novo Programado 2027 (com
  linhas em PARAMETROS), cartão próprio no box Exportações e botão Exportar na tela.
- Teste `teste_contratos_gestao.js` (`npm run contratos-gestao`), com a invariante de não interferência.

## Lote de 29/09/2026 — grupos de fonte e seleção de colunas

Plano: [`docs/planos/grupos-fonte-e-colunas.md`](docs/planos/grupos-fonte-e-colunas.md).
- Filtro **Grupo de fonte** antes de Fonte em todas as telas com fonte (completa: Panorama,
  Programação, Diagnóstico, Decisão, Continuidade e Resultado; simplificada: etapa 2 e base
  saneada); agrupamento por grupo no Saldo e no Resultado.
- Grupos **FONTES COGERF** e **OUTRAS FONTES** embutidos (`modelos/grupos-fontes.xlsx`); crítica
  tolerante (aba GRUPOS opcional, colunas GRUPO duplicadas, código de FONTE NA BASE prevalece).
- **☰ Colunas** em 17 tabelas (completa) e 5 (simplificada); exportações seguem filtros e colunas
  da tela, com a aba COLUNAS OCULTAS; a base saneada da simplificada passa a exportar o que a grade mostra.
- Simplificada: bloco 12 gerado da completa (`testes/gerar_bloco12_simplificado.js`).
- Testes: `teste_colunas`, `teste_grupo_fonte`, `teste_grupos_embutidos`,
  `teste_simplificado_grupos_colunas`; `carregar.js` 40× mais rápido no jsdom.

## Lote de 29/09/2026 — Excluir pelo usuário (auditoria SEPA)

Plano: [`docs/planos/excluir-pelo-usuario.md`](docs/planos/excluir-pelo-usuario.md).
- **Ocultar vira Excluir**, e o excluído, com ou sem regra, sai como os MAPPs das regras
  (completa) ou entra na base saneada com a ação “excluído pelo usuário” (simplificada).
- Sobrevive só quem não tem regra e não foi excluído: acatar e rejeitar passam a ser registro
  (a rejeição não salva mais o MAPP).
- Decisão: `conjuntoSaneamento()`; coluna Regra com “Excluído pelo usuário”; cartões que somam
  (Mantidos no saneamento = todos que saem; Excluídos individualmente = a parte excluída).
- Resultado: situação “Excluído pelo usuário”; o excluído conta só na coluna Excluídos; sai o
  seletor Base da projeção. Exportação Exceções → Excluídos pelo usuário.
- Ficha do MAPP sem os botões Acatar, Rejeitar e Ocultar/Restabelecer (nas duas versões).
- Testes `teste_exclusao.js` e `teste_exclusao_simplificado.js` com os MAPPs da SEPA.

## Lote de 29/09/2026 — envio das planilhas por e-mail

Plano: [`docs/planos/envio-email-orgaos.md`](docs/planos/envio-email-orgaos.md).
- Cadastro de destinatários por órgão (.xlsx obrigatório, modelo, crítica com erros e avisos, na sessão).
- `planilhasDaRodada` extraída de `reemitirRodada`.
- Envio pelo Gmail direto do navegador (Google Identity Services, escopo `gmail.send`), com
  modelo de assunto e mensagem, reenvio de falhas, coluna E-mail nas rodadas, registro em
  `rodada.orgaos[k].emails` e aba ENVIOS POR EMAIL em Exportar manifestações.
- **Pendente (usuário):** criar o ID do cliente OAuth — primeiro na conta Gmail pessoal (Externo, em
  teste), depois na conta da SEPLAG (Interno) — e fazer o ensaio real de envio.
- Exercícios sem saldo do programado ocultos em todo o sistema (grade, exportação, dicas por regra,
  ficha, quadro por MAPP, carteira e gráfico de evolução).

## Lote de 28/09/2026 — resultado centrado no Novo Programado 2027

- Núcleo único de **sobreviventes às regras** (sem regra, ocultados ou com recomendação rejeitada) e
  `npDoMapp`/`npDaLinha`; `mantidos()` deixou de incluir as rejeitadas.
- **Prévia do resultado** na Visão Geral; conjunto *Sobreviventes às regras* no Saldo.
- Análise abre com Revisão da base, **Títulos não comunicativos** e Despesas de continuidade recolhidos.
- Resultado: botão de exportação em destaque; quadro por órgão com **Programado 2027** antes do NP;
  **Quadro por MAPP dos ativos depois**; gráficos só se redesenham quando o que mostram muda.
- Exportações: seis cartões (Resultado, Regras 1 a 4, Situações à margem, Indícios, Exceções, Saldo),
  sem base original, consolidada, CSV e auditoria; colunas enxutas.
- Manifestação: PROGRAMADO 2027 e NOVO PROGRAMADO 2027 no lugar do saldo sem ano.
- **Auditoria removida** do sistema, com o campo de responsável dos diálogos e de Configurações.
- Manual de uso em seis passos; manual técnico em `manual-tecnico.html`.

## Pendências decididas — a implementar

### 3. Fusão verdadeira das abas
Substituir os segmentos que ocultam conteúdo por **página única rolável** no
Panorama, com índice fixo que rola até o bloco (Importação · Indicadores · Universo
· Regras aplicadas · Saldo) e faixa-resumo no topo com os números-chave. Nada de
informação escondida atrás de pílula.

### 7. Segmento “Programação”
Extinguir como segmento próprio e absorver como bloco final da grade de saldos, sob
o título **“Indícios de programação”**. Levar junto o botão *Exportar grade
completa* já existente.

## Em aberto — perguntar antes

- Filtro do saldo: só por órgão, ou também por secretaria?

## Já implementado e estável

Importação e consolidação; motor de regras com âncora temporal relativa; universo de
saneamento; diagnóstico com filtros de seleção múltipla e colunas ordenadoras; ficha
do MAPP com todas as regras testadas e suas evidências; decisão humana; revisão de
consistência da base; saneamento final com exclusão individual e exportação em duas
abas; Antes e Depois; despesas de continuidade; exportações; sessão em
`.json`; tema claro e escuro; sistema de dicas em balão fixo.

## Lote de 23/09/2026 — concluído

- Manifestação dos órgãos reintroduzida em outro modelo (o registro manual do item 2
  do lote de setembro não volta): rodadas de planilhas protegidas por órgão, com
  ExcelJS e JSZip, conferência dos retornos pelo controle interno e token por linha,
  filtro e seção na ficha. Sessão em formato 2, versionada no nome
  (`DDMMAAAA-HHMM-Vnn.json`), gravada e retomada no computador, no GitHub ou nos
  dois, à escolha do usuário.
- Novo Programado 2027 passa a incorporar o saldo de todos os anos anteriores a 2027
  marcados na régua; saiu o campo próprio de anos (Saldo e Resultado). Grade do saldo
  sem a coluna Total (o rodapé mantém os totais).
- Régua sem De/Até, alças e pílulas alinhadas (uma coluna por ano, rolagem lateral em tela
  estreita), recálculo ao soltar; grade do saldo com um ano por coluna, coluna do
  agrupamento fixa e abertura encostada à direita (setas rolam); "Não mostrar novamente"
  nas boas-vindas das duas versões (localStorage).
- Enxugamento das telas (versão completa): abas do alto com número e subtítulo, sem a
  faixa repetida; Visão Geral na ordem rito → Saldo → inconsistências → Programação →
  gráficos, demais blocos recolhidos; saíram Regras aplicadas, Parâmetros em vigor e os
  avisos explicativos (conteúdo no manual); importação vira botão no alto após o
  processamento (também na essencial); régua de exercícios no bloco do Saldo, valendo
  para todo o processamento; filtros de ano mostram anos, não quantidade;
  continuidade por faixa De/Até em anos calendário; bloco do achado só com cartão
  escolhido; **Concluir e exportar resultado** num botão só, pedindo responsável.
- Exercícios de execução considerados: régua com duas alças, **De**/**Até** e um botão
  por ano, nas duas versões (gaveta de configurações na completa, com auditoria;
  bloco “Regras aplicadas” na essencial, com recálculo imediato). Empenhado e pago
  contam só nos anos escolhidos, nas regras e nos totais; programado e saldo usam
  todos. Avisa quando o período corrente ou o histórico da regra 3 fica de fora. O
  texto da regra 1 deixou de citar um intervalo que o cálculo não usava.
- Aba própria **Manifestação** entre Análise e Decisão, com a geração habilitada só com
  sessão ativa (gravada ou retomada na janela); **Baixar de novo** por rodada e por
  órgão; **Retomar sessão** sempre oferece computador ou GitHub, pedindo o acesso na
  hora; opção *Lembrar neste computador* para o acesso ao GitHub.

- Linha totalizadora e cabeçalho fixo das grades com fundo sólido nas duas versões
  (colunas `.corrente` e `.novo-programado` passaram a camada sobre `--papel-2`).
- Boas-vindas de abertura (`modalBV`): passo a passo animado em cinco etapas, só no
  carregamento; a apresentação completa ficou no botão **Apresentação**.
- Importação automática nas duas versões: escolher ou soltar a planilha dispara a
  leitura e o painel de processamento, sem clique em “Importar”; o botão passa a
  **Reprocessar** (refaz a leitura do arquivo carregado), com trava contra
  importações simultâneas (`importarComTrava`, `E.importando`).
- Boas-vindas também na versão essencial, em quatro passos (importar, conferir as
  regras, excluir ou retornar, gerar a base saneada), com atalho para o manual.
- Manual único em `manual.html`, com conteúdo por versão, botão **Manual** nas duas
  versões e ligação por `postMessage`. O manual embutido do `index.html` foi
  retirado. Revisão de conteúdo: guia da versão completa atualizado (importação com
  aba localizada automaticamente, Programação, rótulos atuais), guia próprio da
  versão essencial, Parte II comum (regras, saldo do programado, comparação entre
  versões, glossário) e manual técnico corrigido (arquitetura em três páginas,
  navegação em quatro áreas, ensaio com a aba `Base de Dados`).

## Lote de setembro de 2026 — concluído

- **Item 4 (parcial)** — botão único *Exportar grade completa* no segmento
  Programação: exporta a totalidade de `E.fase2.programacao` (a tela mostra 500
  linhas) em 27 colunas, aba `PROGRAMACAO`. Funções `linhasProgramacao` e
  `exportarProgramacao`. Os demais painéis seguem com seus botões próprios.
- **Item 1** — constante `DOC` e segmento “Aderência ao documento” extintos, com a
  conferência aritmética e a hipótese de universo. No lugar, segmento `seg-regras`
  — **“Regras aplicadas”**: quatro cartões compostos por `dicaRegra()` com a
  população apurada, mais quadro de **parâmetros em vigor** (onze linhas).
  `renderValidacaoDoc` deu lugar a `renderRegrasAplicadas`.
- **Item 2** — prazos e manifestações removidos por inteiro: `E.prazos`,
  `E.manifestacoes`, `desdobrarPrazos`, `abrirPrazo`, `criarManifestacao`,
  `situacaoPrazo`, `situacaoPrazoDoMapp`, `etqPrazo`, `registrarManifestacao`,
  `enviarAoOrgao`, o filtro “Prazo”, as seções da ficha, os conjuntos de exportação
  `manif` e `prazos` e os campos correspondentes da sessão. Os prazos de 30 e 120
  dias permanecem como texto nas explicações e como parâmetros de configuração.
- **Item 8** — coluna **Providência** movida para logo após a caixa de seleção na
  grade do saneamento, replicada na grade do diagnóstico e na ficha do MAPP
  (`data-ficha="ocultar"`), por meio do auxiliar comum `celulaProvidencia`. Aviso
  no topo da aba: remoção individual, reversível e auditada.

- **Item 5** — grade de saldo em ordem cronológica (`Anos anteriores · c−3 · c−2 ·
  c−1 · corrente · futuros · Total · MAPPs`); cabeçalhos só com o ano, explicação
  na dica, exercício corrente com realce discreto (`th.corrente`/`td.corrente`);
  novo filtro de **órgão** em seleção múltipla (`#saldoOrgao`), aplicado em
  `apurarSaldo`. `renderSaldo` deixou de depender da posição dos períodos e passou
  a localizá-los por identificador.
- **Item 6** — novo bloco **“Saldo do programado por regra”** no segmento
  Indicadores: sete cartões (1.a, 1.b, 1.2, 1.3, sobreposição, união e universo)
  com o saldo somado e, na dica, o desdobramento por exercício. Função
  `renderSaldoPorRegra`, chamada ao fim de `renderPainel`.

Pendente deste lote: **ensaio com a planilha real** (`Saneamento Mapps - Exec. 07-26`).
Os ensaios feitos foram `node --check` nos nove blocos, conferência de tags e
`jsdom` com base sintética.

## Lote de 22/09/2026 — apresentação e manual

- **Pop-up de abertura** (`modalApres`): resumo técnico em quatro blocos, fluxo de
  trabalho em quatro macrofases (Aquisição · Análise · Deliberação · Consumação)
  com as nove etapas clicáveis, cadeia de fundamentação e as quatro regras com
  dica. Abre a cada carregamento; reabre pelo botão *Apresentação* do alto.
- **Aba Manual** (`p-manual`, cor ferrugem): situação viva da sessão, Parte I
  (guia de operação em 13 passos) e Parte II (manual técnico em 11 seções), índice
  fixo com realce da seção visível, busca, botões *Copiar* e *Imprimir*.
- Ao alterar funções, abas ou convenções, **atualizar `GUIA` e `TECNICO`** no bloco 10.
