# Saneamento MAPPs

Aplicação web de página única (`index.html`) para importação, consolidação e saneamento de MAPPs (Metas e Ações do Plano Plurianual), com motor de regras, diagnóstico, apuração de saldo, auditoria e exportações.

Disponível em: https://marceloclr.github.io/saneamento

## Como usar

Abra `index.html` diretamente no navegador (ou acesse a URL acima) e importe a planilha (`.xlsx`) com os dados a serem processados. Nenhum dado é enviado a servidores — todo o processamento ocorre localmente no navegador.

## Arquitetura

Arquivo único de aproximadamente 300 KB, sem dependências de build: `<head>` com todo o CSS, `<body>` com a marcação e nove blocos `<script>` sequenciais em JavaScript puro (sem módulos ou framework). Detalhes completos em [`02-arquitetura-do-codigo.md`](02-arquitetura-do-codigo.md).

## Backlog

Itens implementados, pendências e histórico de lotes em [`03-backlog.md`](03-backlog.md).
