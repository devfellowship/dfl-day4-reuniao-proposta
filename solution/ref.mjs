// Reference implementation (lives outside the agent workspace).
// Usage: node solution/ref.mjs environment/casos  -> prints { <caso>: <saida> }
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FRASES = {
  remocao: ['esquece', 'pode tirar', 'não precisa', 'não precisam', 'não preciso', 'não quero', 'deixa de fora'],
  opcional: ['se sobrar', 'se der tempo'],
  desejavel: ['seria bom', 'gostaria'],
  obrigatorio: ['precisa', 'precisam', 'preciso', 'precisamos', 'tem que ter', 'obrigatório'],
};
const INCERTEZA = ['não sei', 'vou ver', 'não decidimos'];
const NUMEROS = {
  um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, quinze: 15, dezesseis: 16, vinte: 20,
};
const UNIDADES = { semana: 1, semanas: 1, 'mês': 4, meses: 4 };

const tokens = (s) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
const has = (toks, expr) => {
  const e = tokens(expr);
  for (let i = 0; i + e.length <= toks.length; i++) if (e.every((w, j) => toks[i + j] === w)) return true;
  return false;
};
const hasAny = (toks, list) => list.some((x) => has(toks, x));

function clausesOf(text) {
  const out = [];
  let cur = '';
  for (const ch of text) {
    if (',.;!?'.includes(ch)) { out.push({ toks: tokens(cur), pergunta: ch === '?' }); cur = ''; } else cur += ch;
  }
  out.push({ toks: tokens(cur), pergunta: false });
  return out.filter((c) => c.toks.length > 0);
}

function parseTranscript(txt) {
  const out = [];
  for (const raw of txt.split('\n')) {
    const m = raw.match(/^\[(\d+)\] (Cliente|Agência) \(([^)]+)\): (.*)$/);
    if (!m) continue;
    out.push({ linha: Number(m[1]), cliente: m[2] === 'Cliente', texto: m[4] });
  }
  return out;
}

const read = (dir, f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

export function resolver(dir) {
  const linhas = parseTranscript(readFileSync(join(dir, 'transcricao.txt'), 'utf8'));
  const catalogo = read(dir, 'catalogo.json');
  const tabela = read(dir, 'tabela.json');
  const checklist = read(dir, 'checklist.json');

  const estado = {}; // modulo -> { tipo, linha }
  const respondidas = new Set();
  let prazo = null;

  for (const l of linhas) {
    if (!l.cliente) continue;
    for (const c of clausesOf(l.texto)) {
      if (c.pergunta) continue;
      // scope
      const tipo = ['remocao', 'opcional', 'desejavel', 'obrigatorio'].find((t) => hasAny(c.toks, FRASES[t]));
      if (tipo) {
        for (const [mod, def] of Object.entries(catalogo)) {
          if (hasAny(c.toks, def.sinonimos)) {
            estado[mod] = { tipo, linha: l.linha };
            if (process.env.DEBUG) console.error(`  [${l.linha}] ${mod} <- ${tipo}`);
          }
        }
      }
      // deadline
      for (let i = 0; i + 1 < c.toks.length; i++) {
        const t = c.toks[i];
        const n = /^\d+$/.test(t) ? Number(t) : NUMEROS[t];
        const u = UNIDADES[c.toks[i + 1]];
        if (n !== undefined && u !== undefined) {
          prazo = n * u;
          if (process.env.DEBUG) console.error(`  [${l.linha}] prazo <- ${prazo}`);
        }
      }
      // checklist
      if (!hasAny(c.toks, INCERTEZA)) {
        for (const q of checklist) {
          if (hasAny(c.toks, q.palavras)) {
            respondidas.add(q.id);
            if (process.env.DEBUG) console.error(`  [${l.linha}] respondida ${q.id}`);
          }
        }
      }
    }
  }

  const escopo = Object.entries(estado)
    .filter(([, s]) => s.tipo !== 'remocao')
    .map(([modulo, s]) => ({ modulo, prioridade: s.tipo, linha: s.linha }))
    .sort((a, b) => (a.modulo < b.modulo ? -1 : 1));
  const fora = Object.entries(estado).filter(([, s]) => s.tipo === 'remocao').map(([m]) => m).sort();
  const pendentes = checklist.map((q) => q.id).filter((id) => !respondidas.has(id)).sort();

  const urg = [...tabela.urgencia].sort((a, b) => a.ate_semanas - b.ate_semanas)
    .find((f) => prazo !== null && prazo <= f.ate_semanas);
  const pctUrg = urg ? urg.pct : 100;

  const preco = (prios) => {
    const set = new Set(escopo.filter((e) => prios.includes(e.prioridade)).map((e) => e.modulo));
    const stack = [...set];
    while (stack.length) {
      const m = stack.pop();
      for (const r of catalogo[m].requer ?? []) if (!set.has(r)) { set.add(r); stack.push(r); }
    }
    if (set.size === 0) return 0;
    if (process.env.DEBUG) console.error(`  pacote ${prios.at(-1)}: ${[...set].sort().join(',')}`);
    let base = 0;
    let horas = 0;
    for (const m of set) {
      for (const [papel, h] of Object.entries(catalogo[m].horas)) {
        base += h * tabela.valor_hora_centavos[papel];
        horas += h;
      }
    }
    const pctDesc = horas >= tabela.desconto_volume.horas_minimas ? tabela.desconto_volume.pct : 0;
    const num = base * pctUrg * (100 - pctDesc); // exact integer, divide by 10000 at the end
    const r = tabela.arredondamento_centavos;
    const den = 10000 * r;
    let v = Math.ceil(num / den) * r;
    if (num % den === 0) v = (num / den) * r;
    return Math.max(v, tabela.minimo_centavos);
  };

  return {
    escopo,
    fora_do_escopo: fora,
    perguntas_pendentes: pendentes,
    prazo_semanas: prazo,
    preco_centavos: {
      essencial: preco(['obrigatorio']),
      recomendado: preco(['obrigatorio', 'desejavel']),
      completo: preco(['obrigatorio', 'desejavel', 'opcional']),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2];
  const all = {};
  for (const c of readdirSync(base).sort()) all[c] = resolver(join(base, c));
  console.log(JSON.stringify(all, null, 2));
}
