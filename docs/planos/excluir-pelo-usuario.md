# Plano — Excluir pelo usuário

Aprovado em 29/09/2026, a partir da simulação do saneamento do órgão SEPA.

## Diagnóstico que motivou o plano

- O botão **Ocultar** fazia o MAPP **sobreviver** às regras (entrava no Novo Programado 2027 e na exportação
  final), mas os textos diziam o contrário ("deixa de constar da exportação final").
- "Resultado do saneamento" tinha dois sentidos: lista dos MAPPs a retirar (textos antigos) e sobreviventes com o
  Novo Programado 2027 (finalidade atual).
- A recomendação **rejeitada** fazia o MAPP sobreviver e, ao mesmo tempo, contava em "Passam a pendentes".
- Os cartões da Decisão não somavam o total (a rejeitada ficava fora de todos).
- O seletor **Projeção** ("Somente as decisões humanas acatadas") mudava as colunas de situação, mas não
  "Ativos depois" nem o Novo Programado 2027.

## Regra nova

Sobrevive somente o MAPP do universo **sem regra e não excluído**. Acatar e rejeitar são registro: não mudam quem
sai. A exclusão prevalece sobre qualquer decisão.

## Etapas

1. **Lógica (completa).**
   - `sobrevive`: sem exceções por rejeição ou ocultação.
   - Excluir vale para qualquer MAPP da Análise, inclusive sem regra.
   - Decisão: o excluído entra na grade; a coluna Regra mostra "Excluído pelo usuário".
   - Cartões: "Mantidos no saneamento" = todos que saem (com regra + excluídos); "Excluídos individualmente"
     mostra a parcela excluída.
   - Resultado: situação nova "Excluído pelo usuário"; coluna e cartão dos excluídos entram na redução do
     conjunto ativo; sai o seletor Projeção; a rejeitada segue o efeito da regra.
   - Exportação: a aba de exceções vira a aba dos excluídos pelo usuário (motivo, responsável, data).
   - Sessão: mesmo formato (`exclusoes`); ocultações de sessões antigas passam a valer como exclusões.
   - Paralisados e dados insuficientes com regra: continuam saindo dos sobreviventes, com a situação inalterada.
2. **Textos e botões.**
   - Ocultar → Excluir em toda a tela (botão, lote, diálogo, etiqueta, dicas).
   - Dicas de Rejeitar e de Ação recomendada corrigidas.
   - Ficha do MAPP: saem Acatar, Rejeitar e Excluir/Restabelecer.
3. **Simplificada.** Mesma regra: o excluído entra na base saneada como "Excluído pelo usuário".
4. **Teste** `testes/teste_exclusao.js` com a SEPA.
   - Decisões: 14 acatada, 17 rejeitada, 18 excluída, 20 acatada e excluída.
   - Esperado: só o MAPP 2 sobrevive (NP 2027 R$ 9.668.515); Mantidos no saneamento 9, dos quais 2 excluídos.
   - Excluindo também o 2: nenhum sobrevive.
5. **Documentação.** Manual, README e arquitetura.
