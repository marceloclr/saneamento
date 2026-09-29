# Grupos de fonte e seleção de colunas, em todo o sistema

## Contexto

Duas melhorias pedidas em 29/09/2026, nas **duas versões** (completa `index.html` e simplificada `simplificado/index.html`).
O envio por e-mail fica parado: o usuário não conseguiu configurar o Google.

- **A. Grupo de fonte.** Um filtro "Grupo de fonte", **sempre antes do filtro Fonte**, em toda tela com valores por fonte.
  Os grupos vêm de uma planilha .xlsx preenchida pelo usuário, que também define os códigos dos grupos. O sistema critica
  o arquivo e grava um JSON compacto. Na revisão, o **Resultado** apareceu **sem filtro de fonte** (cartões, quadros e
  exportação do NP 2027 somam todas as fontes): ele ganha Grupo e Fonte. O grupo também vira opção de **Agrupamento**
  no Saldo e no Resultado.
- **B. Seleção de colunas.** Cada tabela ganha um botão **Colunas**. A tela abre com as colunas atuais, e desmarcar
  uma coluna a remove **na hora**. A escolha **não é lembrada** entre aberturas. **As exportações refletem os filtros e as
  colunas da tela.**

Base: 103 fontes no formato `(500)-(501) Tesouro`. Tabelas: 17 na completa e 5 na simplificada.

---

## A. Grupo de fonte

### A0. Modelo .xlsx, primeiro entregável (antes de qualquer código de filtro)
- **Arquivo no repositório**, `modelos/grupos-fonte-modelo.xlsx`, gerado por script Node (ExcelJS) a partir da base real
  (`mapps-regis18-09.xlsx`), para o usuário começar a preencher já.
- **O mesmo modelo para download no sistema**, pelo botão **Baixar modelo** em Configurações › Grupos de fonte
  (completa) e junto do filtro (simplificada). A aba FONTES é gerada com as fontes da base importada.
- Abas:
  - **INSTRUCOES**: como preencher.
  - **GRUPOS**: `CÓDIGO` · `DESCRIÇÃO`, uma linha por grupo, com o código definido pelo usuário. Vem vazia, com uma linha de exemplo.
  - **FONTES**: `CÓDIGO` · `DESCRIÇÃO` · `GRUPO`, uma linha por fonte. Vem com as fontes da base (código
    `500-501`, descrição `Tesouro`) e a coluna GRUPO em branco, com validação de lista apontando para os
    códigos da aba GRUPOS.
- Cabeçalho congelado e com filtro nas duas abas de dados.

### A1. Leitura, crítica e JSON
- CÓDIGO da fonte: aceita `500-501`, `(500)-(501)` ou `500501` e é normalizado para `500-501` por `codigoFonte(txt)`.
  Sem código que case, compara a DESCRIÇÃO com o nome na base (`norm`).
- **Erros** recusam o arquivo: aba ou coluna ausente; código vazio; grupo repetido; fonte repetida (uma fonte pertence a um
  só grupo); GRUPO que não existe na aba GRUPOS.
- **Avisos**: fonte da base sem grupo (entra em "(sem grupo)", que aparece como opção do filtro); fonte do arquivo ausente
  na base; grupo sem fontes; descrição diferente do nome na base.
- JSON gerado (compacto, busca direta fonte → grupo):
  ```json
  { "versao":1, "origem":"grupos-fonte.xlsx", "gerado":"2026-09-29T10:00:00Z", "hash":"k3x9…",
    "grupos": { "TES":"Tesouro Estadual", "CRED":"Operações de crédito" },
    "fontes": { "500-501":["TES","Tesouro"], "754-259":["CRED","Crédito Externo - BID"] } }
  ```
- **Onde fica.** Embutido nas duas páginas, em `<script type="application/json" id="gruposFontePadrao">`, que funciona
  também em `file://`. Começa vazio; quando o usuário enviar o xlsx preenchido, eu gero o JSON e embuto. O upload troca o
  embutido: na completa vai para a sessão (`gruposFonte` no .json), na simplificada vale enquanto a janela estiver
  aberta. **Baixar JSON** entrega o arquivo gerado.
- Sem grupos carregados, o filtro fica desabilitado, com a dica "carregue os grupos em Configurações".
- O padrão de código reaproveita o do cadastro de destinatários: `lerComoBuffer`, `XLSX.read`, `limpo`, `norm`,
  painel de crítica e `cyrb53`.

### A2. Núcleo do filtro (perto de `casaFonte` `index.html:1903` e `mappNaFonte` `:2874`)
- `grupoDaFonte(fonte)`, com cache, e `opcoesGrupoFonte()`.
- **`fontesDoFiltro(idGrupo, idFonte)`**:
  - com fonte marcada: devolve as fontes marcadas;
  - só com grupo marcado: devolve as fontes da base nesses grupos;
  - sem nada marcado: `[]`.
  - Como a saída continua sendo uma lista de fontes, `mappNaFonte`, `listaNaFonte`, `casaFonte`, `valorCarteira` e
    `notaFontes` servem sem mudança.
- **Cascata**: marcar um grupo restringe as opções de Fonte às fontes desse grupo, como já acontece em
  secretaria → órgão no Recorte. `notaFontes` passa a citar o grupo.

### A3. Telas: Grupo antes de Fonte
| Tela | Filtros | Leitura atual |
|---|---|---|
| Recorte do Panorama (Saldo, Carteira, Indicadores, Saldo por regra) | `panGrupoFonte` → `panFonte` | `recortePanorama` `:3135` |
| Programação | `progGrupoFonte` → `progFonte` | `programacaoFiltrada` `:4831` |
| Diagnóstico | `fGrupoFonte` → `fFonte` | `E.filtro.fonte` `:4236` |
| Decisão | `sGrupoFonte` → `sFonte` | `filtrarSaneamento` `:4961` |
| Despesas de continuidade | `continGrupoFonte` → `continFonte` | `renderFase2` `:4752` |
| **Resultado (faltava)** | `adGrupoFonte` → `adFonte` | ver A4 |
| Simplificada: diagnóstico e base saneada | `fGrupoFonte` → `fFonte` | `simplificado/index.html:770` |

Em cada tela, `valoresMulti('#xFonte')` passa a ser `fontesDoFiltro('#xGrupoFonte','#xFonte')`.

### A4. Resultado: o filtro de fonte que faltava
- Marcação em Cenário projetado (`:1130`), antes de Órgão.
- `passaFiltroAntesDepois` `:5492` com `casaFonte`; `apurarAntesDepois` `:5507` com `listaNaFonte`.
- `linhasQuadroMapp` (`:5859`): só as linhas (MAPP × fonte) das fontes filtradas. Como `npDaLinha` já apura por linha,
  o Programado 2027 e o NP 2027 somam só essas fontes. O mesmo vale para `linhasResultadoPorOrgao` `:5269`,
  `totaisNP` e o topo `resultadoResumoTopo`.
- A exportação do NP 2027 segue os filtros da tela (item B4). A aba PARAMETROS registra grupo, fonte, órgão e busca.

### A5. Agrupamento "Grupo de fonte"
- Saldo (`#saldoAgrupamento`, `apurarSaldo` `:3800`) e Resultado (`#adEstrato`): nova opção `grupo`. Soma
  `m.porFonte` fonte a fonte sob `grupoDaFonte`, do mesmo jeito que o agrupamento `fonte` já faz (NP via `novoProgramadoSerie`).

---

## B. Seleção de colunas

### B1. Controle
- Botão discreto **☰ Colunas (12/14)** acima de cada tabela. Ele abre um painel com uma caixa de marcar por coluna,
  **Marcar todas** e **Restaurar padrão**. Cada mudança aplica na hora.
- **Colunas fixas** (marcadas e desabilitadas, com "(fixa)"): a coluna de identificação (MAPP, ou o
  Agrupamento/Órgão da tabela), a de seleção por caixa e as de ação sem título.
- A escolha fica só em memória (`E.colunasOcultas = { idTabela: Set(rótulo normalizado) }`) e some ao fechar a janela.

### B2. Mecanismo genérico, igual à ordenação (`ligarOrdenacaoGenerica` `:1964`)
- `prepararColunas()`, chamado em `iniciar`, percorre a lista de tabelas (as 17 da completa), insere o botão e liga um
  `MutationObserver` (`childList`, `subtree`) por tabela. Cada nova renderização reaplica a escolha num único
  `requestAnimationFrame`.
- `aplicarColunas(tabela)`:
  - lê os rótulos da última linha do `thead` e mapeia cada célula de `thead`, `tbody` e `tfoot` para a coluna
    lógica, levando em conta o `colspan`;
  - célula inteiramente em colunas ocultas recebe `hidden`; célula que atravessa colunas ocultas tem o `colspan`
    reduzido, com o original guardado em `data-colspan`, o que atende as linhas "vazio" e os rodapés com `colspan`.
- As colunas são identificadas **pelo rótulo**, não pela posição. Assim valem também para tabelas de colunas
  variáveis (anos no Saldo, colunas do Quadro por MAPP): coluna nova aparece marcada, e coluna oculta continua oculta
  enquanto a janela estiver aberta.
- A ordenação genérica e as ordenações próprias continuam funcionando, porque as células ocultas ficam no DOM e os
  índices não mudam.

### B3. Tabelas
- **Completa (17):** tabSaldo, tabInconsNP, tabProgramacao, tabCarCruzada, tabCarTop, tabEstagios, tabIntersecoes,
  tabClassificacao, tabDiag, tabAchado, tabTitulos, tabSaneamento, tabRodadas, tabManif, tabAntesDepois,
  tabQuadroMapp, tabContinuidade.
- **Simplificada (5):** tabEstagios, tabParametros, tabDiag, tabSaneada, tabExcluidos.
- Tabelas pequenas de 2 ou 3 colunas (por exemplo tabParametros) recebem o botão por uniformidade, com a primeira coluna fixa.

### B4. Exportações refletem filtros e colunas da tela
- `colunasExportaveis(idTabela, linhas)` remove de cada linha exportada as chaves que correspondem às colunas ocultas.
  - A correspondência padrão é por nome normalizado (`norm(rótulo) === norm(chave)`).
  - Quando o nome difere, há um mapa de apelidos por tabela, `ALIAS_COLUNAS`, por exemplo no Saldo
    `EXERC. 2026 (CORRENTE)` ↔ `2026`.
  - Colunas de contexto que só existem no arquivo (MEDIDA, CONJUNTO, NP — …) seguem a coluna de tela de que derivam
    no mapa, ou ficam se não derivarem de nenhuma.

| Exportação | Tabela | Ajuste de filtro necessário |
|---|---|---|
| Exportar saldos (`exportarSaldo`) e cartão Saldo | tabSaldo | já segue os filtros |
| Exportar (Diagnóstico, `btnExportarFiltro`) | tabDiag | conferir |
| Exportar achado | tabAchado | conferir |
| Exportar grade completa (Programação) | tabProgramacao | conferir grupo e fonte |
| Continuidade e Títulos (botões e cartão Indícios) | tabContinuidade, tabTitulos | conferir |
| Exportação do saneamento (Decisão) | tabSaneamento | conferir |
| Exportar Antes e Depois | tabAntesDepois | conferir |
| **Exportar resultado — NP 2027** | tabQuadroMapp (aba QUADRO POR MAPP) | **passa a seguir** Grupo, Fonte, Órgão e Busca do Resultado; hoje usa `linhasQuadroMapp(true)`, sem filtros |
| Exportar manifestações | tabManif | — |
| Simplificada: base saneada e excluídos | tabSaneada, tabExcluidos | conferir grupo e fonte |

- Exportações sem tabela na tela (cartões Regras 1 a 4, Situações à margem, Exceções e a aba NP 2027 POR MAPP) mantêm o
  layout completo e respeitam os filtros aplicáveis. Isso fica registrado na aba PARAMETROS ou na dica do cartão.
- Toda exportação filtrada ganha as linhas de parâmetros "Filtros aplicados" e "Colunas ocultas", para rastreabilidade.

---

## Etapas (um commit por etapa, com push; relatório no fim)
0. **Modelo xlsx** no repositório e `baixarModeloGruposFonte()`, nas duas versões.
1. Grupos: leitura, crítica, JSON, embutido vazio, Configurações e sessão.
2. Grupo antes de Fonte nas 5 telas que já têm filtro de fonte.
3. Resultado: Grupo e Fonte (o que faltava) em cartões, quadros e exportação do NP 2027.
4. Agrupamento "Grupo de fonte" no Saldo e no Resultado.
5. Seleção de colunas: mecanismo, botão e painel nas 17 tabelas.
6. Exportações refletindo colunas e filtros (B4).
7. Versão simplificada: grupo de fonte e colunas.
8. Documentação: manual, README, arquitetura e backlog.
9. Quando o usuário enviar o xlsx preenchido: crítica, JSON e embutir nas duas versões.

## Verificação
- `testes/teste_grupo_fonte.js` (jsdom, base real, xlsx sintético com 2 grupos):
  - crítica: cada erro e aviso;
  - modelo: abas, colunas, 103 fontes e validação de lista;
  - equivalência: filtrar pelo grupo G dá o mesmo que marcar à mão as fontes de G, em cada tela;
  - Resultado: grupo A + grupo B + "(sem grupo)" = total sem filtro, no NP e no P27;
  - agrupamento por grupo: soma das linhas = total;
  - cascata de opções;
  - sessão com e sem `gruposFonte`.
- `testes/teste_colunas.js`:
  - em cada tabela, ocultar uma coluna esconde as células certas em `thead`, `tbody` e `tfoot` (com `colspan`);
  - a escolha sobrevive a uma nova renderização causada por filtro;
  - as colunas fixas não podem ser desmarcadas;
  - a exportação correspondente sai sem a coluna e com a linha "Colunas ocultas";
  - Restaurar padrão devolve todas as colunas.
- `carregar.js` passa a aceitar o caminho da página, para rodar os mesmos roteiros na simplificada.
- Regressão: `anos-sem-saldo`, `todas-fontes`, `filtros`.
- Visual no navegador (servidor local): ordem Grupo → Fonte, painel de colunas e tabelas largas (Saldo, Quadro por MAPP).
