import { NOMES, SOBRENOMES } from "../data/nomes";
import { ESTADOS, cidadesDoEstado } from "../data/brasil";
import { chance, pick, randi } from "../rng";
import type { Atributos, Jogador, PeDominante, Personalidade, Posicao } from "../types";
import { POSICOES } from "../types";
import { makeId } from "../ids";

export type LocalScouting =
  | "Campo Municipal"
  | "Quadra"
  | "Escolinha"
  | "Escola"
  | "Várzea"
  | "Academia de Futebol";

export const LOCAIS: {
  nome: LocalScouting;
  descricao: string;
  custo: number;
  idadeMin: number;
  idadeMax: number;
  qualidadeBase: number; // média
  variancia: number;
  minJogadores: number;
  maxJogadores: number;
}[] = [
  { nome: "Escolinha", descricao: "Crianças em formação inicial", custo: 50, idadeMin: 8, idadeMax: 12, qualidadeBase: 40, variancia: 15, minJogadores: 8, maxJogadores: 20 },
  { nome: "Escola", descricao: "Categorias sub em colégios", custo: 80, idadeMin: 10, idadeMax: 14, qualidadeBase: 45, variancia: 18, minJogadores: 8, maxJogadores: 20 },
  { nome: "Quadra", descricao: "Futsal e técnica apurada", custo: 100, idadeMin: 10, idadeMax: 16, qualidadeBase: 50, variancia: 20, minJogadores: 6, maxJogadores: 18 },
  { nome: "Campo Municipal", descricao: "Peladas de bairro e categorias de base", custo: 120, idadeMin: 12, idadeMax: 18, qualidadeBase: 50, variancia: 22, minJogadores: 10, maxJogadores: 25 },
  { nome: "Várzea", descricao: "Talentos brutos e imprevisíveis", custo: 150, idadeMin: 14, idadeMax: 22, qualidadeBase: 55, variancia: 28, minJogadores: 5, maxJogadores: 20 },
  { nome: "Academia de Futebol", descricao: "Centros de treinamento reconhecidos", custo: 400, idadeMin: 15, idadeMax: 19, qualidadeBase: 65, variancia: 20, minJogadores: 5, maxJogadores: 15 },
];

function gaussian(): number {
  // Box–Muller
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

export function calcularValorMercado(j: Jogador): number {
  const media =
    (j.atributos.velocidade +
      j.atributos.passe +
      j.atributos.finalizacao +
      j.atributos.defesa +
      j.atributos.fisico +
      j.atributos.tecnica +
      j.atributos.mental) /
    7;
  const fatorIdade = j.idade < 20 ? 1.6 : j.idade < 25 ? 1.3 : j.idade < 30 ? 1.0 : 0.6;
  const fatorPot = 1 + Math.max(0, j.potencial - media) / 100;
  const base = Math.pow(media, 2.4) * 8;
  return Math.round(base * fatorIdade * fatorPot);
}

export function gerarJogador(
  counters: Record<string, number>,
  local: (typeof LOCAIS)[number],
  contexto?: { estadoPreferido?: string },
): { jogador: Jogador; counters: Record<string, number> } {
  const { id, counters: c2 } = makeId(counters, "PLR");
  const nome = pick(NOMES);
  const sobrenome = pick(SOBRENOMES);
  const idade = randi(local.idadeMin, local.idadeMax);
  const estado =
    contexto?.estadoPreferido && chance(0.55)
      ? ESTADOS.find((e) => e.sigla === contexto.estadoPreferido)!
      : pick(ESTADOS);
  const cidade = pick(cidadesDoEstado(estado.sigla));
  const posicao: Posicao = pick(POSICOES);

  // Potencial: 40-100, raro > 85
  const roll = Math.random();
  let potencial: number;
  if (roll < 0.02) potencial = randi(88, 99);
  else if (roll < 0.1) potencial = randi(78, 87);
  else if (roll < 0.5) potencial = randi(60, 77);
  else potencial = randi(40, 60);

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
    clubeAtualId: chance(0.3) ? null : null, // categoria de base local, sem clube no MVP
    empresarioId: null,
    potencial,
    potencialConhecido: "none",
    observacaoNivel: 0,
    atributos,
    personalidade: pick(PERSONALIDADES),
    salario: 0,
    valorMercado: 0,
    historico: [],
  };
  jogador.valorMercado = calcularValorMercado(jogador);
  return { jogador, counters: c2 };
}

export function explorarLocal(
  counters: Record<string, number>,
  local: (typeof LOCAIS)[number],
  contexto?: { estadoPreferido?: string },
): { jogadores: Jogador[]; counters: Record<string, number> } {
  const qtd = randi(local.minJogadores, local.maxJogadores);
  const jogadores: Jogador[] = [];
  let c = counters;
  for (let i = 0; i < qtd; i++) {
    const r = gerarJogador(c, local, contexto);
    jogadores.push(r.jogador);
    c = r.counters;
  }
  return { jogadores, counters: c };
}
