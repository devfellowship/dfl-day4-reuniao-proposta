# Task: Transcrição de reunião em proposta que o cliente assina

Uma agência de software sai da reunião de descoberta com a transcrição e precisa mandar uma proposta que o cliente
possa assinar. O agente lê a transcrição, o catálogo de módulos, a tabela de preços, o checklist, a equipe e a lista
de riscos, e monta a proposta em quatro etapas encadeadas (um erro cedo se propaga):

1. **`proposta`** — escopo confirmado pelo cliente (prioridade e linha), o que ele tirou, perguntas sem resposta,
   prazo em semanas e preço de três pacotes (dependências, urgência, desconto, arredondamento, mínimo).
2. **`cronograma`** — o pacote recomendado feito um módulo por vez com a capacidade da equipe (pessoas × horas),
   respeitando dependências e uma ordem de desempate fixa; total de semanas e se estoura o prazo.
3. **`riscos`** — sinais de risco nas falas do cliente (e o prazo estourado) viram horas de contingência que
   recalculam o preço do pacote recomendado.
4. **`pagamento`** — à vista ou parcelado conforme o cliente pediu: entrada, limite e mínimo de parcela, centavos
   que sobram na última parcela e vencimento preso ao fim dos módulos do cronograma.

| Pasta | O que é |
|---|---|
| `instruction.md` | o prompt que o agente recebe |
| `tests/public/` | 20 testes de **formato**: um por etapa em cada `exemplo-*` (confere campos e tipos, não os valores) |
| `solution/` | solução de referência: **bloqueada até o fim do hackathon** |
| `visual.json` | versão para humanos dos casos públicos e das etapas (renderizada no site) |
| `task.json` | o contrato da task (valida no schema do TestMyAgent) |


> Esta é a metade pública: 5 casos, sem as respostas. Os testes daqui só conferem o formato de `out/<caso>.json`. A nota final vem de testes ocultos que conferem os valores, nestes 5 casos e em outros 5 dos mesmos níveis.
