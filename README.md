# Saneamento MAPPs

Aplicação web de página única (`index.html`) para importação, consolidação e saneamento de MAPPs (Monitoramento de Ações e Projetos Prioritários), com motor de regras, diagnóstico, apuração de saldo, auditoria e exportações.

Disponível em: https://marceloclr.github.io/saneamento

## Como usar

Abra `index.html` diretamente no navegador (ou acesse a URL acima) e importe a planilha (`.xlsx`) com os dados a serem processados. Nenhum dado é enviado a servidores — todo o processamento ocorre localmente no navegador.

## Arquitetura

Arquivo único de aproximadamente 300 KB, sem dependências de build: `<head>` com todo o CSS, `<body>` com a marcação e nove blocos `<script>` sequenciais em JavaScript puro (sem módulos ou framework). Detalhes completos em [`02-arquitetura-do-codigo.md`](02-arquitetura-do-codigo.md).

## Manifestação dos órgãos e sessão

A aba **Manifestação**, entre Análise e Decisão, gera uma planilha protegida por órgão (só as colunas de resposta são editáveis) com os MAPPs enquadrados nas Regras 1 a 4, e grava junto a nova versão da sessão, com nomes casados `DDMMAAAA-HHMM-Vnn.json` e `DDMMAAAA-HHMM-Vnn-ÓRGÃO.xlsx`. Os órgãos devolvem as planilhas pelo canal oficial; o sistema confere cada uma pelo controle interno (rodada e token por linha), registra as manifestações e as mostra na ficha, no filtro do diagnóstico e na auditoria. A manifestação não decide nada: acatar ou rejeitar continua sendo ato humano.

A geração exige uma sessão gravada ou retomada na janela (é ela que dá a versão e casa os nomes); gravar não descarta nada, então não é preciso recarregar o .json recém-gerado. **Baixar de novo** refaz, idênticas, as planilhas de uma rodada.

A sessão pode ser gravada e retomada **no computador, num repositório GitHub privado ou nos dois**, à escolha do usuário a cada gravação. O acesso ao GitHub é pedido na hora ou em Configurações › Sessão e armazenamento; o token fica na memória da janela, ou no navegador se o usuário marcar *Lembrar neste computador*.

## Manual

Um único manual, [`manual.html`](manual.html), atende às duas versões. O botão **Manual**, no alto de cada sistema, abre o manual em janela própria já na versão correspondente (`?versao=completa` ou `?versao=essencial`); aberto pelo sistema, o manual mostra os números da sessão e leva o sistema à tela de cada passo do guia. Também pode ser aberto diretamente em https://marceloclr.github.io/saneamento/manual.html, com seletor de versão no alto.

## Versão simplificada

Para quem só precisa importar a planilha, ver em qual regra cada MAPP se enquadra e
remover o que não deve entrar no resultado, há uma versão radicalmente mais simples em
[`simplificado/index.html`](simplificado/index.html), disponível em:
https://marceloclr.github.io/saneamento/simplificado

Sem tela de configuração (usa sempre os parâmetros oficiais, exceto os exercícios de
execução considerados, escolhidos numa régua no bloco "Regras aplicadas"), sem revisão de
consistência, auditoria ou demais análises do sistema completo. Remover ou restaurar um
MAPP é um clique só, sem exigir responsável ou justificativa. A "base saneada" resultante
é exibida na tela, sempre com linhas e colunas totalizadoras, e pode ser exportada em
`.xlsx`, nas abas RESULTADO DO SANEAMENTO e EXCLUIDOS, com o saldo do programado por fonte em coluna própria.

## Backlog

Itens implementados, pendências e histórico de lotes em [`03-backlog.md`](03-backlog.md).
