import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Format only: field names and value types of out/<caso>.json. The values are graded by the hidden tests.
type Schema = { types: string[]; required?: boolean; keys?: Record<string, Schema>; values?: Schema; items?: Schema };

const kind = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

function check(value: unknown, s: Schema, path: string, errors: string[]) {
  const k = kind(value);
  if (!s.types.includes("any") && !s.types.includes(k)) return void errors.push(`${path}: esperado ${s.types.join(" | ")}, veio ${k}`);
  if (k === "object" && s.values) for (const [key, val] of Object.entries(value as object)) check(val, s.values, `${path}.${key}`, errors);
  if (k === "object" && s.keys) {
    const obj = value as Record<string, unknown>;
    for (const [key, sub] of Object.entries(s.keys)) {
      if (key in obj) check(obj[key], sub, `${path}.${key}`, errors);
      else if (sub.required) errors.push(`${path}.${key}: campo faltando`);
    }
    for (const key of Object.keys(obj)) if (!(key in s.keys)) errors.push(`${path}.${key}: campo que não existe no formato`);
  }
  if (k === "array" && s.items) (value as unknown[]).forEach((item, i) => check(item, s.items!, `${path}[${i}]`, errors));
}

const STAGES: Record<string, Schema> = {
  "proposta": {
    "types": [
      "object"
    ],
    "keys": {
      "escopo": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "modulo": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "prioridade": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "linha": {
              "required": true,
              "types": [
                "number"
              ]
            }
          }
        }
      },
      "fora_do_escopo": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "string"
          ]
        }
      },
      "perguntas_pendentes": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "string"
          ]
        }
      },
      "prazo_semanas": {
        "required": true,
        "types": [
          "null",
          "number"
        ]
      },
      "preco_centavos": {
        "required": true,
        "types": [
          "object"
        ],
        "keys": {
          "essencial": {
            "required": true,
            "types": [
              "number"
            ]
          },
          "recomendado": {
            "required": true,
            "types": [
              "number"
            ]
          },
          "completo": {
            "required": true,
            "types": [
              "number"
            ]
          }
        }
      }
    }
  },
  "cronograma": {
    "types": [
      "object"
    ],
    "keys": {
      "modulos": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "modulo": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "inicio": {
              "required": true,
              "types": [
                "number"
              ]
            },
            "fim": {
              "required": true,
              "types": [
                "number"
              ]
            }
          }
        }
      },
      "total_semanas": {
        "required": true,
        "types": [
          "number"
        ]
      },
      "estoura_prazo": {
        "required": true,
        "types": [
          "boolean"
        ]
      }
    }
  },
  "riscos": {
    "types": [
      "object"
    ],
    "keys": {
      "ids": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "string"
          ]
        }
      },
      "horas_contingencia": {
        "required": true,
        "types": [
          "number"
        ]
      },
      "preco_recomendado_centavos": {
        "required": true,
        "types": [
          "number"
        ]
      }
    }
  },
  "pagamento": {
    "types": [
      "object"
    ],
    "keys": {
      "forma": {
        "required": true,
        "types": [
          "string"
        ]
      },
      "valor_total_centavos": {
        "required": true,
        "types": [
          "number"
        ]
      },
      "parcelas": {
        "required": true,
        "types": [
          "array"
        ],
        "items": {
          "types": [
            "object"
          ],
          "keys": {
            "tipo": {
              "required": true,
              "types": [
                "string"
              ]
            },
            "semana": {
              "required": true,
              "types": [
                "number"
              ]
            },
            "valor_centavos": {
              "required": true,
              "types": [
                "number"
              ]
            }
          }
        }
      }
    }
  }
};

const CASOS = ["exemplo-1","exemplo-2","exemplo-3","exemplo-4","exemplo-5"];

describe("formato da saída", () => {
  for (const caso of CASOS) {
    for (const [etapa, schema] of Object.entries(STAGES)) {
      it(`${caso} · ${etapa}`, () => {
        const file = `out/${caso}.json`;
        expect(existsSync(file), `${file} não existe`).toBe(true);
        const out = JSON.parse(readFileSync(file, "utf8"));
        expect(out, `${file} sem a chave "${etapa}"`).toHaveProperty(etapa);
        const errors: string[] = [];
        check(out[etapa], schema, etapa, errors);
        expect(errors).toEqual([]);
      });
    }
  }
});
