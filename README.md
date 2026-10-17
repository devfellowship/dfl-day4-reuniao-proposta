# Task: Transcrição de reunião em proposta comercial

Uma agência de software sai da reunião de descoberta com a transcrição e precisa devolver uma proposta com preço.
O agente lê a transcrição, o catálogo de módulos, a tabela de preços e o checklist, e escreve o escopo confirmado,
o que o cliente tirou, as perguntas que ficaram sem resposta, o prazo e o preço de três pacotes.

| Pasta | O que é |
|---|---|
| `instruction.md` | o prompt que o agente recebe |
| `tests/public/` | 5 testes, um por `exemplo-*` |
| `solution/` | solução de referência (`solution.patch`) e o gerador (`ref.mjs`). **Não leia antes de tentar** |
| `visual.json` | versão para humanos dos casos públicos (renderizada no site) |
| `task.json` | o contrato da task (valida no schema do TestMyAgent) |

O `exemplo-2` tem as armadilhas: o cliente pede o app e depois diz "esquece o app"; a agência sugere
notificações e site institucional, mas só o cliente decide ("Hum, interessante" não inclui nada); "notificação
por push não precisa" é retirada, mesmo contendo `precisa`; "pix" é sinônimo de `integracao_pagamento`;
pergunta do cliente ("o cadastro tem que ter login com Google?") não decide nada; relatórios mudam de
prioridade numa fala posterior; "umas oito semanas" = 8, exatamente no limite inclusivo da faixa de urgência;
"Hospedagem eu não sei" não responde a pergunta do checklist; e o pacote recomendado passa das 300 horas e
ganha desconto.

> Esta é a metade pública: 5 casos. A avaliação final usa também 5 casos ocultos, nos mesmos níveis, que não estão neste repo. `tests/hidden/` aqui é a cópia dos públicos.
