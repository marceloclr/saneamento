# Plano — Contratos de Gestão (C.G.)

Aprovado em 30/09/2026. Tela de marcação dos MAPPs que são contratos de gestão, só na versão completa.

## Contexto

É preciso separar os MAPPs que são **Contratos de Gestão**, sem mexer no saneamento. Ao carregar o .xlsx, o sistema continua aplicando as Regras 1 a 4 como já faz. Depois, varre **todos os MAPPs consolidados** atrás de menções a Contrato de Gestão e mostra os identificados numa tela nova, no mesmo molde de “Despesas de continuidade”: cartões, grade e botão Exportar. Nessa tela, o usuário também pode marcar um MAPP que a varredura não pegou e remover qualquer marcação. Os MAPPs marcados ganham uma aba própria no **Exportar resultado — Novo Programado 2027**. A marcação é só informativa: não altera `sobrevive`, as regras, as exclusões nem o Novo Programado.

Decisões do usuário: **só a versão completa** (`index.html`); a varredura cobre **todos os MAPPs da base**.

## Evidência na base de referência (`mapps-regis18-09.xlsx`)

Entre as colunas de texto, a única com menções é o título do MAPP (`m.titulo`). Dois padrões, aplicados sobre `norm(m.titulo)` (maiúsculas, sem acento), pegam **42 MAPPs** de 12 órgãos, sem falso positivo aparente:
- `/CONTRATOS? DE GESTAO/`: “Contrato de Gestão…”, “Aditivos aos Contratos de Gestão…”
- `/(^|[^A-Z0-9])C\.? ?G\.?(?![A-Z0-9])/`: “(C.G - SDA)”, “C.G. -”, “(CG)”, “- CG.”, “(C.G PSJ)”. Não casa com `CGDT`, `COGERH` e similares.

Os 42 servem de número de referência no teste.

## Implementação (tudo em `index.html`)

### 1. Estado e sessão
- Em `E` , adicionar `cg:{ incluidos:{}, removidos:{} }`. As duas chaves são `m.chave` (ÓRGÃO + MAPP), com valor `{data}`.
- `montarSessao` passa a gravar `cg:E.cg`. `aplicarSessao` lê `E.cg=d.cg||{incluidos:{},removidos:{}}`, sem quebrar sessões antigas.

### 2. Identificação (bloco 2, logo após `calcularFase2`)
- `RE_CG` com os dois padrões e `mencionaCG(m)`, que testa `norm(m.titulo)`.
- `calcularCG()`: percorre `E.mapps` e grava `E.cgAuto` (Set de chaves).
- `ehCG(m)` = (automático ou em `E.cg.incluidos`) e não em `E.cg.removidos`. `origemCG(m)` devolve “Automática” ou “Manual”.
- `listaCG()` devolve os MAPPs marcados. `listaCGRemovidos()` devolve os automáticos cuja marcação foi removida.
- Chamar `calcularCG()` no mesmo ponto em que `calcularFase2()` é chamado depois da importação (localizar o chamador). Não toca em `diagnosticar`, `avaliar` nem `sobrevive`.

### 3. Tela nova `p-contratos` (seção HTML depois de `p-fase2`)
- Bloco `recolhivel` com o título **“Contratos de Gestão (C.G.)”** e a legenda “Marcação informativa — não interfere no saneamento”.
- Cartões (`cartao`): MAPPs marcados (automáticos + manuais), órgãos envolvidos, Programado 2027 e Novo Programado 2027 (`npDoMapp`), e quantos também estão enquadrados em regra ou excluídos.
- Grade `tabContratos` com MAPP, Órgão, Título (`seloFontes`), Origem, Situação no saneamento (`situacaoDepois(m)` ou “Fora do universo”), Programado 2027, NP 2027 e um botão **Remover marcação**. A linha clicável abre `abrirFicha`, como na Continuidade.
- Barra de ações:
  - campo de busca (código, título ou órgão) que filtra a grade;
  - **Marcar MAPP como C.G.**: campo de busca sobre `E.mapps` que ainda não estão marcados, lista até 20 resultados, cada um com o botão “Marcar”;
  - **Exportar**.
- Subbloco **Marcações removidas**, com os automáticos desmarcados e o botão **Restaurar**.
- Remover um automático grava em `removidos`; remover um manual apaga de `incluidos`. Marcar um automático que tinha sido removido apaga de `removidos`; marcar outro MAPP grava em `incluidos`. Cada ação chama `renderContratos()` e `renderExportacoes()`.
- Navegação: incluir `'contratos'` em `grupos.analise` e em `aliases` de `irParaAba`. Chamar `renderContratos()` quando a aba Análise abre e acrescentar `['Contratos de Gestão',renderContratos]` em `renderTudo`. Atualizar o `data-tip` da aba Análise.
- Registrar `tabContratos` em `TABELAS_COLUNAS` para ter o ☰ Colunas, como as demais grades.

### 4. Exportação
- `linhasCG()` reaproveita `linhasMapp` e acrescenta `ORIGEM DA MARCAÇÃO`, `TRECHO IDENTIFICADO` (o que casou com o padrão) e `SITUAÇÃO NO SANEAMENTO` (regras atendidas ou exclusão).
- **Exportação geral** — `exportarResultadoNP`: nova aba **`CONTRATOS DE GESTAO`** depois de QUADRO POR ORGAO, com todos os MAPPs marcados (não segue os filtros do Cenário, porque a marcação é independente do resultado).
- Box Exportações — `conjuntos()`: novo cartão **“Contratos de Gestão (C.G.)”**, com arquivo `contratos_de_gestao` e aba `CONTRATOS DE GESTAO` (`tabela:'tabContratos'`). O botão Exportar da tela usa o mesmo conjunto por `exportarAbas`.
- `linhasParametrosResultado`: uma linha informando quantos C.G. foram marcados (automáticos e manuais) e o critério de busca.

### 5. Documentação (padrão do repositório)
- `docs/planos/contratos-de-gestao.md` com este plano.
- `manual.html` (seção `completa`, na Análise), `README.md`, `02-arquitetura-do-codigo.md` (bloco 2 e bloco 7/9, estado `E.cg`, aba `p-contratos`) e `03-backlog.md`.

## Verificação

1. **Teste novo `testes/teste_contratos_gestao.js`**, no molde de `teste_exclusao.js` e reaproveitando `carregar.js`, com script `contratos-gestao` no `package.json`. Ele confere:
   - 42 identificados automaticamente, entre eles SDA 758, SCIDADES 4597, SEPLAG 313 e SECULT 749; nenhum com `CGDT` isolado;
   - mesmo resultado antes e depois de marcar e remover: `sobreviventes()`, `totaisNP()` e as populações das regras não mudam (invariante de não interferência);
   - marcar um MAPP manualmente, remover um automático e restaurar, com as contagens batendo;
   - ida e volta da sessão: `montarSessao` → `aplicarSessao` preserva `E.cg`, e uma sessão sem `cg` carrega;
   - `conjuntos()` com o cartão novo e `linhasCG()` com as colunas extras.
2. Rodar também `teste_exclusao.js` e `teste_filtros.js` para confirmar que nada regrediu.
3. `node --check` em cada bloco `<script>` e conferência do balanceamento de tags, conforme “Como editar” em `02-arquitetura-do-codigo.md`.
4. Teste no Brave por servidor HTTP local (memória: `file://` falha no Flatpak): importar a base, abrir Análise › Contratos de Gestão, marcar, remover, restaurar, exportar o resultado e conferir a aba CONTRATOS DE GESTAO.
5. Commit (Conventional Commits, `feat:` para o código e `docs:` para a documentação) e push para `marceloclr/saneamento`.
