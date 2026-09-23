# Backlog

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
abas; Antes e Depois; despesas de continuidade; auditoria; exportações; sessão em
`.json`; tema claro e escuro; sistema de dicas em balão fixo.

## Lote de 23/09/2026 — concluído

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
