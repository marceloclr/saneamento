# Saneamento MAPPs

Aplicação web de página única (`saneamento_mapps.html`) para importação, consolidação e saneamento de MAPPs (Metas e Ações do Plano Plurianual), com motor de regras, diagnóstico, apuração de saldo, auditoria e exportações.

## Como usar

Abra `saneamento_mapps.html` diretamente no navegador e importe a planilha (`.xlsx`) com os dados a serem processados. Nenhum dado é enviado a servidores — todo o processamento ocorre localmente no navegador.

## Arquitetura

Arquivo único de aproximadamente 300 KB, sem dependências de build: `<head>` com todo o CSS, `<body>` com a marcação e nove blocos `<script>` sequenciais em JavaScript puro (sem módulos ou framework). Detalhes completos em [`02-arquitetura-do-codigo.md`](02-arquitetura-do-codigo.md).

## Backlog

Itens implementados, pendências e histórico de lotes em [`03-backlog.md`](03-backlog.md).
