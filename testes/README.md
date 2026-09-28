# Testes sem navegador

Carregam o `index.html` no [jsdom](https://github.com/jsdom/jsdom), importam a planilha
`mapps-regis18-09.xlsx` da raiz do repositório e conferem o sistema chamando as funções
diretamente. Os scripts `<script src>` de CDN são retirados; o `xlsx` vem do npm, e Chart.js
e ExcelJS ficam ausentes (gráficos e planilhas de manifestação não são testados aqui).

```
cd testes
npm install
npm run filtros        # filtros de todas as telas e valores por fonte
npm run todas-fontes   # todas as fontes marcadas = sem filtro de fonte
```

A carga da planilha leva cerca de 3 minutos. Cada teste imprime um JSON com o esperado e o obtido.

- `carregar.js` — monta o jsdom, converte o buffer do arquivo para o `xlsx` do Node e espera
  o fim da importação (`E.importando`). Reutilize-o em novos testes.
- Evite redesenhar grades grandes (Quadro por MAPP, Saldo) repetidamente: no jsdom isso é
  muito lento. Prefira chamar `filtrar()`, `filtrarSaneamento()`, `diagPanorama()`,
  `programacaoFiltrada()` etc. e marcar filtros direto em `MULTIS[id].escolha`.
