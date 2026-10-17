# Transcrição de reunião → proposta comercial

Uma agência de software saiu de uma reunião de descoberta com o cliente. Você lê a transcrição e monta a
proposta: o escopo que o cliente confirmou, o que ele tirou, as perguntas que ficaram sem resposta, o prazo e
o preço de três pacotes.

## Entrada: `casos/<caso>/`

| Arquivo | Conteúdo |
|---|---|
| `transcricao.txt` | uma fala por linha: `[NNN] Cliente (Nome): texto` ou `[NNN] Agência (Nome): texto`. `NNN` é o número da linha (ex.: `[007]` = linha 7) |
| `catalogo.json` | `{ "<modulo>": { "horas": { "<papel>": n }, "sinonimos": ["...", ...], "requer": ["<modulo>", ...] } }` — `requer` pode não existir (= nenhum) |
| `tabela.json` | `{ "valor_hora_centavos": { "<papel>": n }, "urgencia": [{ "ate_semanas", "pct" }], "desconto_volume": { "horas_minimas", "pct" }, "arredondamento_centavos", "minimo_centavos" }` |
| `checklist.json` | `[{ "id", "pergunta", "palavras": ["...", ...] }]` — perguntas que toda reunião de descoberta deveria responder |

## Regras

### Como ler a transcrição

1. **Só falas do Cliente contam.** Qualquer pessoa marcada `Cliente` vale (pode haver mais de uma). Falas da
   `Agência` são ignoradas para tudo (escopo, prazo, perguntas), mesmo quando sugerem módulo, prazo ou preço.
2. **Oração** = pedaço do texto da fala entre os sinais `,` `.` `;` `!` `?` (o início e o fim do texto também
   delimitam). Cada oração é analisada sozinha.
3. **Pergunta não decide nada:** oração terminada em `?` é ignorada para tudo (escopo, prazo e perguntas).
4. **Casar uma expressão** (sinônimo, frase-chave ou palavra do checklist) = ela aparece na oração como
   **palavra(s) inteira(s)**, ignorando maiúsculas/minúsculas. Acento conta (`não` ≠ `nao`). Ex.: `app` casa com
   "o app", mas **não** com "apps"; `site institucional` casa com "o Site Institucional".
5. Uma oração **menciona** um módulo quando casa com algum dos `sinonimos` dele no `catalogo.json`
   (o id do módulo, como `app_mobile`, não é sinônimo).

### Escopo

6. **Frases-chave.** Uma oração do cliente recebe **uma** classificação, testada nesta ordem (a primeira que
   casar vence):
   1. `remocao`: `esquece`, `pode tirar`, `não precisa`, `não precisam`, `não preciso`, `não quero`, `deixa de fora`
   2. `opcional`: `se sobrar`, `se der tempo`
   3. `desejavel`: `seria bom`, `gostaria`
   4. `obrigatorio`: `precisa`, `precisam`, `preciso`, `precisamos`, `tem que ter`, `obrigatório`

   Ex.: "não precisa de app" é `remocao` (mesmo contendo `precisa`); "gostaria de relatórios se der tempo" é
   `opcional`. Oração sem nenhuma frase-chave não muda nada, mesmo mencionando módulo.
7. A classificação vale para **todos** os módulos mencionados naquela oração.
8. **A última palavra é do cliente:** percorra as orações em ordem (linha a linha, da esquerda para a direita).
   Cada oração classificada sobrescreve o estado dos módulos que menciona. O estado final de cada módulo decide:
   - `obrigatorio` / `desejavel` / `opcional` → entra em `escopo`, com essa `prioridade` e a `linha` da
     oração que definiu esse estado final (a última);
   - `remocao` → entra em `fora_do_escopo` (inclusive módulo que nunca tinha sido pedido);
   - módulo nunca classificado pelo cliente → não aparece em nenhuma das duas listas.

### Prazo

9. **Prazo** = vem de orações do cliente com um **número seguido imediatamente** da unidade `semana`,
   `semanas`, `mês` ou `meses`. O número pode ser em algarismos (`12`) ou por extenso: `um`/`uma`=1,
   `dois`/`duas`=2, `três`=3, `quatro`=4, `cinco`=5, `seis`=6, `sete`=7, `oito`=8, `nove`=9, `dez`=10,
   `onze`=11, `doze`=12, `treze`=13, `quatorze`=14, `quinze`=15, `dezesseis`=16, `vinte`=20.
   `mês`/`meses` valem **4 semanas** cada (ex.: "dois meses" = 8). Sem número logo antes ("semana que vem",
   "por mês") não é prazo.
10. Vale a **última** ocorrência na transcrição. Se nenhuma oração do cliente tiver prazo, `prazo_semanas` = `null`.

### Perguntas pendentes

11. Uma pergunta do `checklist.json` está **respondida** quando alguma oração do cliente (que não seja
    pergunta) casa com uma das `palavras` dela **e** não contém `não sei`, `vou ver` nem `não decidimos`.
    Basta uma oração válida; uma incerteza em outra oração não desfaz a resposta.
12. `perguntas_pendentes` = ids das perguntas não respondidas.

### Preço

13. **Pacotes:** `essencial` = módulos `obrigatorio`; `recomendado` = `obrigatorio` + `desejavel`;
    `completo` = `obrigatorio` + `desejavel` + `opcional`.
14. **Dependências:** se um módulo do pacote tem `requer`, os módulos exigidos entram no preço desse pacote
    (e os que eles exigirem, e assim por diante), **mesmo que estejam em `fora_do_escopo` ou nunca tenham sido
    citados**. Cada módulo conta uma vez só. Isso afeta só o preço, não as listas `escopo`/`fora_do_escopo`.
15. **Base** do pacote = soma, em todos os módulos do pacote, de `horas[papel] × valor_hora_centavos[papel]`.
    **Horas** do pacote = soma de todas as horas de todos os papéis desses módulos.
16. **Urgência:** com `prazo_semanas` não nulo, escolha a faixa de `urgencia` de **menor** `ate_semanas` tal que
    `prazo_semanas ≤ ate_semanas` (limite **inclusivo**); `pct_urgencia` = o `pct` dela. Nenhuma faixa serve, ou
    prazo `null` → `pct_urgencia` = 100.
17. **Desconto de volume:** se as horas do pacote forem **maiores ou iguais** a `desconto_volume.horas_minimas`,
    `pct_desconto` = `desconto_volume.pct`; senão 0.
18. **Valor** = `base × pct_urgencia / 100 × (100 − pct_desconto) / 100`, **sem arredondar no meio**. Depois
    arredonde **para cima** até o próximo múltiplo de `arredondamento_centavos` (um valor que já é múltiplo
    fica igual).
19. **Mínimo:** se o valor arredondado ficar abaixo de `minimo_centavos`, o preço é `minimo_centavos`.
    Pacote **sem nenhum módulo** custa `0` (o mínimo não se aplica).

## Saída: `out/<caso>.json`

```json
{
  "escopo": [{ "modulo": "login", "prioridade": "obrigatorio", "linha": 5 }],
  "fora_do_escopo": ["app_mobile"],
  "perguntas_pendentes": ["hospedagem"],
  "prazo_semanas": 8,
  "preco_centavos": { "essencial": 1500000, "recomendado": 1500000, "completo": 1500000 }
}
```

- `escopo`: um objeto por módulo, ordenado por `modulo` (ordem alfabética do id). `prioridade` ∈
  `obrigatorio` | `desejavel` | `opcional`. `linha` é inteiro (`[032]` → `32`).
- `fora_do_escopo` e `perguntas_pendentes`: arrays de ids em ordem alfabética (podem ser vazios `[]`).
- `prazo_semanas`: inteiro ou `null`.
- `preco_centavos`: inteiros em centavos.
