import { NOMES, SOBRENOMES } from "../data/nomes";
import { ESTADOS, cidadesDoEstado } from "../data/brasil";
import { chance, pick, randi } from "../rng";
import type { Atributos, Jogador, PeDominante, Personalidade, Posicao } from "../types";
import { POSICOES } from "../types";
import { makeId } from "../ids";

export type LocalKey =
  | "quadra"
  | "campo_municipal"
  | "escolinha"
  | "varzea_sub17"
  | "varzea_sub20"
  | "varzea_sub23"
  | "varzea_livre"
  | "veterano"
  | "academia";

export type Local = {
  key: LocalKey;
  nome: string;
  descricao: string;
  tipo: "partida" | "treino";
  custo: number;
  idadeMin: number;
  idadeMax: number;
  qualidadeBase: number;
  variancia: number;
  potencialMax: number;
  nivelAgenciaRequerido: number;
};

export const LOCAIS: Local[] = [
  { key: "quadra", nome: "Quadra de Bairro", descricao: "Peladas de bairro, idades misturadas.", tipo: "partida", custo: 40, idadeMin: 10, idadeMax: 35, qualidadeBase: 38, variancia: 18, potencialMax: 70, nivelAgenciaRequerido: 1 },
  { key: "campo_municipal", nome: "Campo Municipal", descricao: "Rachões locais com jogadores de todas as idades.", tipo: "partida", custo: 80, idadeMin: 12, idadeMax: 40, qualidadeBase: 42, variancia: 20, potencialMax: 78, nivelAgenciaRequerido: 1 },
  { key: "escolinha", nome: "Escolinha de Futebol", descricao: "Categorias de base infantil (treino).", tipo: "treino", custo: 120, idadeMin: 8, idadeMax: 14, qualidadeBase: 45, variancia: 18, potencialMax: 95, nivelAgenciaRequerido: 2 },
  { key: "varzea_sub17", nome: "Várzea Sub-17", descricao: "Torneio de base amador. Talento bruto.", tipo: "partida", custo: 180, idadeMin: 15, idadeMax: 17, qualidadeBase: 52, variancia: 22, potencialMax: 92, nivelAgenciaRequerido: 2 },
  { key: "varzea_sub20", nome: "Várzea Sub-20", descricao: "Categoria de acesso amador.", tipo: "partida", custo: 240, idadeMin: 18, idadeMax: 20, qualidadeBase: 56, variancia: 20, potencialMax: 90, nivelAgenciaRequerido: 3 },
  { key: "varzea_sub23", nome: "Várzea Sub-23", descricao: "Última chance de vitrine para muitos.", tipo: "partida", custo: 320, idadeMin: 21, idadeMax: 23, qualidadeBase: 60, variancia: 20, potencialMax: 88, nivelAgenciaRequerido: 3 },
  { key: "varzea_livre", nome: "Várzea Livre", descricao: "Torneios amadores adultos.", tipo: "partida", custo: 400, idadeMin: 18, idadeMax: 32, qualidadeBase: 60, variancia: 22, potencialMax: 85, nivelAgenciaRequerido: 4 },
  { key: "veterano", nome: "Torneio de Veteranos", descricao: "Jogadores experientes ainda em atividade.", tipo: "partida", custo: 350, idadeMin: 33, idadeMax: 40, qualidadeBase: 62, variancia: 18, potencialMax: 75, nivelAgenciaRequerido: 4 },
  { key: "academia", nome: "Academia de Futebol", descricao: "Centro de treinamento de elite.", tipo: "treino", custo: 800, idadeMin: 15, idadeMax: 19, qualidadeBase: 70, variancia: 18, potencialMax: 99, nivelAgenciaRequerido: 5 },
];

export function getLocal(key: LocalKey): Local | undefined {
  return LOCAIS.find((l) => l.key === key);
}

function gaussian(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function gerarAtributos(base: number, variancia: number, potencial: number): Atributos {
  const g = () => clamp(Math.round(base + gaussian() * variancia * 0.5), 20, Math.min(99, potencial));
  return {
    velocidade: g(),
    passe: g(),
    finalizacao: g(),
    defesa: g(),
    fisico: g(),
    tecnica: g(),
    mental: g(),
  };
}

const PERSONALIDADES: Personalidade[] = [
  "Ambicioso", "Leal", "Ganancioso", "Discreto", "Trabalhador", "Rebelde",
];

const PES: PeDominante[] = ["Destro", "Destro", "Destro", "Canhoto", "Ambidestro"];

export function overallJogador(j: Jogador): number {
  const a = j.atributos;
  return Math.round((a.velocidade + a.passe + a.finalizacao + a.defesa + a.fisico + a.tecnica + a.mental) / 7);
}

export function calcularValorMercado(j: Jogador): number {
  const media = overallJogador(j);
  const fatorIdade = j.idade < 20 ? 1.6 : j.idade < 25 ? 1.3 : j.idade < 30 ? 1.0 : 0.6;
  const fatorPot = 1 + Math.max(0, j.potencial - media) / 100;
  const base = Math.pow(media, 2.4) * 8;
  return Math.round(base * fatorIdade * fatorPot);
}

export function gerarJogador(
  counters: Record<string, number>,
  local: Local,
  contexto: { estadoPreferido?: string; posicao?: Posicao } = {},
): { jogador: Jogador; counters: Record<string, number> } {
  const { id, counters: c2 } = makeId(counters, "PLR");
  const nome = pick(NOMES);
  const sobrenome = pick(SOBRENOMES);
  const idade = randi(local.idadeMin, local.idadeMax);
  const estado =
    contexto.estadoPreferido && chance(0.55)
      ? ESTADOS.find((e) => e.sigla === contexto.estadoPreferido)!
      : pick(ESTADOS);
  const cidade = pick(cidadesDoEstado(estado.sigla));
  const posicao: Posicao = contexto.posicao ?? pick(POSICOES);

  const roll = Math.random();
  let potencial: number;
  if (roll < 0.02) potencial = randi(Math.min(88, local.potencialMax - 4), local.potencialMax);
  else if (roll < 0.1) potencial = randi(Math.min(75, local.potencialMax - 10), local.potencialMax - 4);
  else if (roll < 0.5) potencial = randi(55, Math.min(74, local.potencialMax - 10));
  else potencial = randi(40, 55);

  // Idade avançada não tem margem para crescer
  if (idade >= 28) potencial = Math.min(potencial, Math.max(overallBase(local), 50));

  const atributos = gerarAtributos(local.qualidadeBase, local.variancia, potencial);

  const jogador: Jogador = {
    id,
    nome,
    sobrenome,
    idade,
    nacionalidade: "Brasileiro",
    estado: estado.sigla,
    cidade,
    posicao,
    peDominante: pick(PES),
    clubeAtualId: null,
    empresarioId: null,
    potencial,
    potencialConhecido: "none",
    observacaoNivel: 0,
    atributos,
    personalidade: pick(PERSONALIDADES),
    salario: 0,
    valorMercado: 0,
    historico: [],
    historicoCarreira: [],
  };
  jogador.valorMercado = calcularValorMercado(jogador);
  return { jogador, counters: c2 };
}

function overallBase(local: Local): number {
  return local.qualidadeBase;
}

// Formação canônica 4-3-3 para gerar 11 posições coerentes
const FORMACAO_11: Posicao[] = [
  "GOL", "LD", "ZAG", "ZAG", "LE", "VOL", "MC", "MEI", "PD", "ATA", "PE",
];

export function gerarPartidaTimes(
  counters: Record<string, number>,
  local: Local,
  contexto: { estadoPreferido?: string } = {},
): { jogadores: Jogador[]; counters: Record<string, number> } {
  const jogadores: Jogador[] = [];
  let c = counters;
  for (let time = 0; time < 2; time++) {
    for (const pos of FORMACAO_11) {
      const r = gerarJogador(c, local, { ...contexto, posicao: pos });
      jogadores.push(r.jogador);
      c = r.counters;
    }
  }
  return { jogadores, counters: c };
}

export function gerarTreino(
  counters: Record<string, number>,
  local: Local,
  contexto: { estadoPreferido?: string } = {},
): { jogadores: Jogador[]; counters: Record<string, number> } {
  const qtd = randi(14, 18);
  const jogadores: Jogador[] = [];
  let c = counters;
  for (let i = 0; i < qtd; i++) {
    const r = gerarJogador(c, local, contexto);
    jogadores.push(r.jogador);
    c = r.counters;
  }
  return { jogadores, counters: c };
}
