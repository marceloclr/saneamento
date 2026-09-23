# Saneamento MAPPs

Aplicação web de página única (`index.html`) para importação, consolidação e saneamento de MAPPs (Monitoramento de Ações e Projetos Prioritários), com motor de regras, diagnóstico, apuração de saldo, auditoria e exportações.

Disponível em: https://marceloclr.github.io/saneamento

## Como usar

Abra `index.html` diretamente no navegador (ou acesse a URL acima) e importe a planilha (`.xlsx`) com os dados a serem processados. Nenhum dado é enviado a servidores — todo o processamento ocorre localmente no navegador.

## Arquitetura

Arquivo único de aproximadamente 300 KB, sem dependências de build: `<head>` com todo o CSS, `<body>` com a marcação e nove blocos `<script>` sequenciais em JavaScript puro (sem módulos ou framework). Detalhes completos em [`02-arquitetura-do-codigo.md`](02-arquitetura-do-codigo.md).

## Manual

Um único manual, [`manual.html`](manual.html), atende às duas versões. O botão **Manual**, no alto de cada sistema, abre o manual em janela própria já na versão correspondente (`?versao=completa` ou `?versao=essencial`); aberto pelo sistema, o manual mostra os números da sessão e leva o sistema à tela de cada passo do guia. Também pode ser aberto diretamente em https://marceloclr.github.io/saneamento/manual.html, com seletor de versão no alto.

## Versão simplificada

Para quem só precisa importar a planilha, ver em qual regra cada MAPP se enquadra e
remover o que não deve entrar no resultado, há uma versão radicalmente mais simples em
[`simplificado/index.html`](simplificado/index.html), disponível em:
https://marceloclr.github.io/saneamento/simplificado

Sem tela de configuração (usa sempre os parâmetros oficiais), sem revisão de
consistência, auditoria ou demais análises do sistema completo. Remover ou restaurar um
MAPP é um clique só, sem exigir responsável ou justificativa. A "base saneada" resultante
é exibida na tela, sempre com linhas e colunas totalizadoras, e pode ser exportada em
`.xlsx`, nas abas RESULTADO DO SANEAMENTO e EXCLUIDOS, com o saldo do programado por fonte em coluna própria.

## Backlog

Itens implementados, pendências e histórico de lotes em [`03-backlog.md`](03-backlog.md).
