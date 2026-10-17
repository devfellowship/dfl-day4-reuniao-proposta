import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const out = (caso: string) => JSON.parse(readFileSync(`out/${caso}.json`, 'utf8'));

describe('casos exemplo', () => {
  it("exemplo-1 (simples)", () => {
    expect(out("exemplo-1")).toEqual({
      "escopo": [
        {
          "modulo": "login",
          "prioridade": "obrigatorio",
          "linha": 6
        },
        {
          "modulo": "painel_admin",
          "prioridade": "obrigatorio",
          "linha": 3
        },
        {
          "modulo": "relatorios",
          "prioridade": "desejavel",
          "linha": 8
        }
      ],
      "fora_do_escopo": [],
      "perguntas_pendentes": [
        "orcamento"
      ],
      "prazo_semanas": 12,
      "preco_centavos": {
        "essencial": 1770000,
        "recomendado": 2420000,
        "completo": 2420000
      }
    });
  });

  it("exemplo-2 (brabo: retirada, sugestão da agência, prazo por extenso no limite, pix, não precisa)", () => {
    expect(out("exemplo-2")).toEqual({
      "escopo": [
        {
          "modulo": "agenda",
          "prioridade": "obrigatorio",
          "linha": 7
        },
        {
          "modulo": "integracao_pagamento",
          "prioridade": "desejavel",
          "linha": 11
        },
        {
          "modulo": "login",
          "prioridade": "obrigatorio",
          "linha": 5
        },
        {
          "modulo": "painel_admin",
          "prioridade": "obrigatorio",
          "linha": 7
        },
        {
          "modulo": "relatorios",
          "prioridade": "obrigatorio",
          "linha": 32
        }
      ],
      "fora_do_escopo": [
        "app_mobile",
        "notificacoes"
      ],
      "perguntas_pendentes": [
        "hospedagem",
        "integracoes"
      ],
      "prazo_semanas": 8,
      "preco_centavos": {
        "essencial": 4230000,
        "recomendado": 4650000,
        "completo": 4650000
      }
    });
  });

  it("exemplo-3 (brabo: dependência, meses, vários clientes, opcional vence desejável)", () => {
    expect(out("exemplo-3")).toEqual({
      "escopo": [
        {
          "modulo": "chat",
          "prioridade": "obrigatorio",
          "linha": 3
        },
        {
          "modulo": "integracao_erp",
          "prioridade": "desejavel",
          "linha": 12
        },
        {
          "modulo": "integracao_pagamento",
          "prioridade": "desejavel",
          "linha": 16
        },
        {
          "modulo": "login",
          "prioridade": "opcional",
          "linha": 6
        },
        {
          "modulo": "painel_admin",
          "prioridade": "obrigatorio",
          "linha": 9
        },
        {
          "modulo": "relatorios",
          "prioridade": "opcional",
          "linha": 29
        }
      ],
      "fora_do_escopo": [
        "app_mobile"
      ],
      "perguntas_pendentes": [
        "hospedagem"
      ],
      "prazo_semanas": 12,
      "preco_centavos": {
        "essencial": 3250000,
        "recomendado": 4850000,
        "completo": 5550000
      }
    });
  });

  it("exemplo-4 (brabo: prazo nulo, volta atrás, opcional vence desejável, mínimo)", () => {
    expect(out("exemplo-4")).toEqual({
      "escopo": [
        {
          "modulo": "integracao_pagamento",
          "prioridade": "obrigatorio",
          "linha": 5
        },
        {
          "modulo": "notificacoes",
          "prioridade": "opcional",
          "linha": 15
        },
        {
          "modulo": "relatorios",
          "prioridade": "obrigatorio",
          "linha": 26
        },
        {
          "modulo": "site_institucional",
          "prioridade": "obrigatorio",
          "linha": 3
        }
      ],
      "fora_do_escopo": [
        "app_mobile"
      ],
      "perguntas_pendentes": [
        "identidade_visual",
        "orcamento"
      ],
      "prazo_semanas": null,
      "preco_centavos": {
        "essencial": 2300000,
        "recomendado": 2300000,
        "completo": 2460000
      }
    });
  });

  it("exemplo-5 (super pica: tudo junto)", () => {
    expect(out("exemplo-5")).toEqual({
      "escopo": [
        {
          "modulo": "agenda",
          "prioridade": "obrigatorio",
          "linha": 5
        },
        {
          "modulo": "integracao_erp",
          "prioridade": "obrigatorio",
          "linha": 65
        },
        {
          "modulo": "integracao_pagamento",
          "prioridade": "desejavel",
          "linha": 22
        },
        {
          "modulo": "login",
          "prioridade": "obrigatorio",
          "linha": 12
        },
        {
          "modulo": "relatorios",
          "prioridade": "obrigatorio",
          "linha": 44
        }
      ],
      "fora_do_escopo": [
        "app_mobile",
        "chat",
        "notificacoes",
        "painel_admin",
        "site_institucional"
      ],
      "perguntas_pendentes": [
        "hospedagem",
        "orcamento",
        "suporte"
      ],
      "prazo_semanas": 8,
      "preco_centavos": {
        "essencial": 5590000,
        "recomendado": 6530000,
        "completo": 6530000
      }
    });
  });
});
