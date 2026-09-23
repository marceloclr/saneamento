# Arquitetura do `index.html`

Arquivo único, cerca de 350 KB: `<head>` com todo o CSS, `<body>` com
a marcação, e onze blocos `<script>` sequenciais. Tudo em JavaScript simples, sem
módulos nem framework. O único uso de `localStorage` é opcional: lembrar o acesso ao
GitHub quando o usuário marca *Lembrar neste computador*.

## Blocos de script, na ordem

1. **Núcleo** — constantes (`REGRAS`, `GRUPOS_ESTAGIO`, `CFG_OFICIAL`), estado
   global `E`, utilitários de formatação pt-BR, **motor de dicas** (`iniciarDicas`,
   `tip`, `sinal`), **componente de seleção múltipla** (`montarMulti`,
   `valoresMulti`, `casaMulti`, `limparMulti`), **ordenação genérica de grades**,
   navegação de abas e segmentos, **âncora temporal** (`aplicarAncora`,
   `anoCorrenteEfetivo`), leitura do arquivo, reconhecimento de colunas,
   `montarBase`, `consolidar`, e os somatórios `soma` / `somaAno` / `valorLinha`.
   **Exercícios de execução** (`E.cfg.execAnos`, `null` = todos): `soma`, `somaAno`
   e `somaAnoArray` ignoram os anos fora da seleção, e `anosExec()` dá os anos das
   colunas, gráficos e exportações; assim a escolha vale para todo o processamento.
   Só `valorLinha` (reconstrução da base original) e a âncora leem a série inteira.
   `faixaSelecionada` só deixa usar o indicador “Sem Exec” com a faixa inteira
   escolhida. A régua (`montarReguaExec`) e `avisosExecAnos` são as mesmas nas duas
   versões; na completa, fica no bloco do Saldo e aplica na hora (`aplicarExecAnos`,
   com auditoria); na essencial, em Regras aplicadas, também na hora.
2. **Regras** — `executou`, `noUniverso`, `avaliar`, `diagnosticar`,
   `calcularQualidade`, `calcularFase2`, `composicaoUniverso`, e os textos
   explicativos `dicaRegra`, `dicaEstagio`, `dicaAcao`, `dicaConfianca`.
3. **Painel** — `cartao`, `renderTudo`, `renderResumoImport`, `renderPainel`,
   `desenharGraficos`, `tiposGrafico`, paleta dos gráficos.
4. **Saldo** — `periodosSaldo`, `apurarSaldo`, `renderSaldo`, `linhasSaldo`,
   `exportarSaldo`.
5. **Diagnóstico** — filtros, `renderDiagnostico`, `marcarOrdem`,
   `registrarDecisao`, `abrirFicha`.
6. **Universo, qualidade e auditoria** — `renderUniverso`, `renderQualidade`,
   `mostrarAchado`, `renderFase2`, `renderAuditoria`.
7. **Saneamento final** — grade do conjunto enquadrado, `ocultarMapps`,
   `restabelecerMapps`, `finalizarSaneamento`, `exportarResultadoFinal`.
8. **Antes e Depois** — `situacaoAntes`, `situacaoDepois`, `apurarAntesDepois`,
   `renderAntesDepois`, `desenharAntesDepois`.
9. **Exportações e ligações** — `linhasMapp`, `conjuntos()`, `exportar`,
   configurações (`cfgParaTela`, `aplicarConfig`), sessão em `.json`,
   `ligarEventos`, `iniciar`.
10. **Boas-vindas, apresentação e manual** — `ICONES`/`icone`, `APR_FASES`,
   `APR_DESTINO`, `abrirApresentacao`, `fecharApresentacao`, boas-vindas
   (`BV_PASSOS`, `abrirBoasVindas`, `mostrarBV`), ligação com o manual único
   (`abrirManual`, `estadoParaManual`, `enviarEstadoManual`, chamada ao fim de
   `renderTudo`), `iniciarManual`. Apenas lê o estado `E`; nada altera.
11. **Manifestação e sessão** — rodadas de planilhas por órgão (`gerarRodada`,
   `montarPlanilhaOrgao`, com ExcelJS e JSZip), conferência dos retornos
   (`importarRetornos`, `aplicarRetornos`), situação por MAPP (`situacaoManif`),
   sessão versionada (`gravarSessao`, `aplicarSessao`) e GitHub (`githubGravar`,
   `githubListar`, `githubLer`); diálogo de escolha `perguntar`, sobre o `#modal`.

## Estado global `E`

`arquivo`, `buffer`, `colunas`, `anos`, `metricas`, `dic` (dicionários de strings),
`linhas` (registros dicionarizados, valores em `Float64Array`), `mapps`
(consolidados), `indice`, `cfg`, `decisoes`, `exclusoes`, `auditoria`,
`encerramento`, `diag`, `qualidade`, `fase2`, `saldo`, `ad`, filtros, paginação e
gráficos; no bloco 11, `versaoSessao`, `rodadas`, `manifestacoes`, `destinoSessao` e
`github` (o token nunca vai ao `.json`; vai ao `localStorage` só se o usuário marcar). A base original é reconstruída para exportação a partir dos dicionários.

## Abas e identificadores

`p-panorama` (segmentos `seg-importacao`, `seg-indicadores`, `seg-universo`,
`seg-saldo`), `p-diagnostico`, `p-qualidade` (rótulo “Revisão”), `p-saneamento`,
`p-antesdepois`, `p-fase2` (rótulo “Despesas de continuidade”), `p-auditoria` e
`p-manifestacao` (aba própria “Manifestação”, entre Análise e Decisão; habilita a geração
só com sessão ativa, `sessaoAtiva()`).
Boas-vindas de abertura `modalBV` (véu `veuBV`), exibidas só no carregamento;
apresentação completa `modalApres` (véu `veuApres`), aberta pelo botão do alto.
Configurações em gaveta lateral `gavetaConfig`, aberta pelo botão do alto.

A Visão Geral é uma página única: rito, importação (some depois de processada; fica o
botão **Importar outra base** no alto), Saldo por exercício, inconsistências do Novo
Programado, Programação e gráficos; os demais blocos têm a classe `recolhivel` e abrem
recolhidos (`prepararRecolhiveis`). `irParaSegmento` rola até o bloco `#seg-<id>`.
As abas do alto trazem número e subtítulo; a antiga faixa `fluxoPrincipal` saiu.
Na Decisão, `concluirEExportar` pede responsável e observação (`perguntar`), declara a
conclusão e exporta. Filtros de seleção múltipla com anos mostram os anos (`faixasTexto`).

Rótulo e identificador são coisas distintas: identificadores permanecem, rótulos
mudam por mapa.

## Sessão formato 2 e rodadas de manifestação

`gravarSessao` incrementa `E.versaoSessao` e grava `DDMMAAAA-HHMM-Vnn.json` no destino
escolhido pelo usuário (computador, GitHub ou ambos). O `.json` acrescenta ao formato 1
`formato`, `versao`, `nome`, `assinaturaBase`, `rodadas`, `manifestacoes` e `cfgSessao`;
`aplicarSessao` aceita os dois formatos.

Cada planilha de rodada tem as abas INSTRUÇÕES, MAPPS (protegida; só H a L
editáveis, listas por regra em `RESPOSTAS`, coluna oculta com
`cyrb53(rodada|órgão|chave)`) e CONTROLE (`veryHidden`: rodada, versão, órgão, datas,
hash). Na importação manda o CONTROLE, não o nome do arquivo. A senha de proteção é
só contra alteração acidental.

GitHub: API de conteúdo (`PUT`/`GET /repos/{dono}/{repo}/contents/{pasta}/…`), token
fine-grained com *Contents: read and write* num repositório privado de dados.

## Manual único (`manual.html`)

O manual deixou de viver dentro do `index.html`. `manual.html`, na raiz, atende às
duas versões: cada seção declara `ambas`, `completa` ou `essencial`, e a versão
exibida vem do parâmetro `?versao=` que o botão **Manual** de cada sistema passa (na
falta dele, do endereço de origem; por fim, `completa`). A Parte III, manual
técnico, só aparece na versão completa.

Aberto pelo sistema, o manual conversa com a janela de origem por `postMessage`:
envia `{fonte:'webmapp-manual', tipo:'pronto'}`, recebe
`{fonte:'webmapp', tipo:'estado', versao, base, cartoes, regras, parametros, legenda}`
(montado por `estadoParaManual`) e pede telas com `{tipo:'ir', versao, destino}`.
Aceita-se apenas mensagem da mesma origem (ou `null` em `file://`). Aberto
isoladamente, o manual funciona como documento estático, sem os números da sessão.

## Como editar

Alterações cirúrgicas por `str_replace` no arquivo do projeto. Antes de entregar:

    # sintaxe de cada bloco de script
    python3 -c "import re,subprocess;[...extrair <script>...]" && node --check bloco.js
    # balanceamento de tags no corpo

## Como testar com a base real

Harness em Node com `jsdom` + `xlsx`: carrega o HTML com `runScripts:'dangerously'`
(as bibliotecas de CDN não sobem no jsdom — o código tolera a ausência do Chart.js),
lê a aba `Base de Dados` do .xlsx (com `cellDates`, `dense`, `defval:null` e
`blankrows:false`, como faz `importar`), chama `window.montarBase(linhas,'Base de Dados')`,
`consolidar()`, `diagnosticar()` e `renderTudo()`, e confere contagens, populações
por regra, grades renderizadas e fluxos de decisão. O estado interno se alcança por
`window.eval('E')`, pois `E` é `const` e não vira propriedade de `window`.

O parse do .xlsx leva cerca de 10 s: **rodar o teste uma vez por lote**, ao final, e
imprimir só o resumo.

## Números de referência da extração de 18/09/2026 (`mapps-regis18-09.xlsx`)

Servem de sanidade, não de meta: 31.177 linhas úteis, 21.463 MAPPs consolidados,
universo de saneamento com 6.473, e — com âncora automática em 2026 e critério de
empenho — regra 1.a 796, regra 1.b 688, regra 1.2 2.455, regra 1.3 538, união 4.014.
Os mesmos números constam do manual técnico (seção “Números de referência”).
