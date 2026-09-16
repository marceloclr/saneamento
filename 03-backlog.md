# Backlog

## Pendências decididas — a implementar

Nenhuma no momento.

## Em aberto — perguntar antes

- Filtro do saldo: só por órgão, ou também por secretaria?

## Já implementado e estável

Importação e consolidação; motor de regras com âncora temporal relativa; universo de
saneamento; diagnóstico com filtros de seleção múltipla e colunas ordenadoras; ficha
do MAPP com todas as regras testadas e suas evidências; decisão humana; revisão de
consistência da base; saneamento final com exclusão individual e exportação em duas
abas; Antes e Depois; despesas de continuidade; auditoria; exportações; sessão em
`.json`; tema claro e escuro; sistema de dicas em balão fixo.

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

## Lote de setembro de 2026 (II) — concluído

- **Item 7** — segmento “Programação” extinto. Seu bloco passou a ser o último do
  segmento de saldo (`#blocoIndiciosProgramacao`, acento ocre), sob o título
  **“Indícios de programação”**, com o botão *Exportar grade completa*.
  Identificadores `cartoesProgramacao`, `tabProgramacao`, `programacaoLegenda` e
  `btnExportarProgramacao` preservados.
- **Item 3** — Panorama convertido em **página única rolável**: nenhum segmento
  oculto; cada um abre com um marco de seção (`.marco-segmento`) na cor do seu
  acento. As pílulas viraram **índice fixo** (`.indice`, `position:sticky` sob o
  cabeçalho, altura medida por `medirTopo` em `--alto-topo`), com `aria-current`
  e ponto colorido por bloco. `irParaSegmento(id, modo)` mantém o nome e agora rola
  (`suave`, `instantaneo`, `sem-rolar`); `marcarSegmento` e `acompanharRolagem`
  realçam o bloco em leitura. Nova **faixa-resumo** (`#resumoPanorama`,
  `renderResumoPanorama`, chamada em `renderTudo` e em `iniciar`): linhas
  importadas, MAPPs consolidados, universo, união das regras, saldo do universo e
  saldo do exercício corrente; cada número leva ao bloco que o detalha e traz a
  fórmula na dica. `irParaAba('panorama')` passou a redesenhar os gráficos sempre.

Ensaios deste lote: `node --check` nos nove blocos, balanceamento de tags e `jsdom`
com base sintética (saldo corrente da faixa conferido contra a grade de saldos).
Segue pendente o **ensaio com a planilha real**, agora cobrindo os dois lotes.
