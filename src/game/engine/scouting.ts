import { NOMES, SOBRENOMES } from "../data/nomes";
import { ESTADOS, cidadesDoEstado } from "../data/brasil";
import { chance, pick, randi } from "../rng";
import type { Atributos, Jogador, PeDominante, Personalidade, Posicao } from "../types";
import { POSICOES } from "../types";
import { makeId } from "../ids";

export type LocalKey =
  | "pelada_rua"
  | "quadra"
  | "campo_municipal"
  | "varzea_sub17"
  | "varzea_sub20"
  | "varzea_livre"
  | "escolinha"
  | "interescolar"
  | "copa_regional_sub17"
  | "copa_regional_sub20"
  | "veterano"
  | "base_clube_pequeno"
  | "base_clube_grande"
  | "academia";

export type LocalCategoria = "Amador" | "Regional" | "Base" | "Elite";

export type Local = {
  key: LocalKey;
  nome: string;
  descricao: string;
  categoria: LocalCategoria;
  tipo: "partida" | "treino";
  custo: number;
  idadeMin: number;
  idadeMax: number;
  qualidadeBase: number;
  variancia: number;
  potencialMax: number;
  nivelAgenciaRequerido: number;
  /** raridade de talentos "raros" (0-1). Locais melhores têm curva mais generosa. */
  raridade: number;
};

export const LOCAIS: Local[] = [
  // Amador — desbloqueado desde o início
  { key: "pelada_rua", nome: "Pelada de Rua", descricao: "Racha de rua improvisado. Talento raro e cru.", categoria: "Amador", tipo: "partida", custo: 20, idadeMin: 10, idadeMax: 35, qualidadeBase: 25, variancia: 16, potencialMax: 55, nivelAgenciaRequerido: 1, raridade: 0.005 },
  { key: "quadra", nome: "Quadra de Bairro", descricao: "Peladas de bairro, idades misturadas.", categoria: "Amador", tipo: "partida", custo: 40, idadeMin: 10, idadeMax: 35, qualidadeBase: 28, variancia: 18, potencialMax: 60, nivelAgenciaRequerido: 1, raridade: 0.01 },
  { key: "campo_municipal", nome: "Campo Municipal", descricao: "Rachões locais de vários bairros.", categoria: "Amador", tipo: "partida", custo: 60, idadeMin: 12, idadeMax: 40, qualidadeBase: 32, variancia: 18, potencialMax: 65, nivelAgenciaRequerido: 1, raridade: 0.015 },
  { key: "varzea_sub17", nome: "Várzea Sub-17", descricao: "Torneio de base amador. Talento bruto.", categoria: "Amador", tipo: "partida", custo: 90, idadeMin: 15, idadeMax: 17, qualidadeBase: 38, variancia: 20, potencialMax: 78, nivelAgenciaRequerido: 1, raridade: 0.02 },
  { key: "varzea_sub20", nome: "Várzea Sub-20", descricao: "Categoria amadora de acesso.", categoria: "Amador", tipo: "partida", custo: 110, idadeMin: 18, idadeMax: 20, qualidadeBase: 40, variancia: 20, potencialMax: 76, nivelAgenciaRequerido: 1, raridade: 0.02 },
  { key: "varzea_livre", nome: "Várzea Livre", descricao: "Torneios amadores adultos.", categoria: "Amador", tipo: "partida", custo: 130, idadeMin: 18, idadeMax: 34, qualidadeBase: 42, variancia: 20, potencialMax: 72, nivelAgenciaRequerido: 1, raridade: 0.015 },

  // Regional — nível 2
  { key: "escolinha", nome: "Escolinha de Futebol", descricao: "Categoria infantil. Bruto mas com espaço para crescer.", categoria: "Regional", tipo: "treino", custo: 220, idadeMin: 8, idadeMax: 14, qualidadeBase: 42, variancia: 18, potencialMax: 88, nivelAgenciaRequerido: 2, raridade: 0.05 },
  { key: "interescolar", nome: "Torneio Interescolar", descricao: "Competição entre escolas da cidade.", categoria: "Regional", tipo: "partida", custo: 260, idadeMin: 12, idadeMax: 16, qualidadeBase: 44, variancia: 20, potencialMax: 82, nivelAgenciaRequerido: 2, raridade: 0.04 },

  // Base — nível 3
  { key: "copa_regional_sub17", nome: "Copa Regional Sub-17", descricao: "Competição estadual de base.", categoria: "Base", tipo: "partida", custo: 480, idadeMin: 15, idadeMax: 17, qualidadeBase: 52, variancia: 20, potencialMax: 88, nivelAgenciaRequerido: 3, raridade: 0.08 },
  { key: "copa_regional_sub20", nome: "Copa Regional Sub-20", descricao: "Última vitrine antes do profissional.", categoria: "Base", tipo: "partida", custo: 540, idadeMin: 18, idadeMax: 20, qualidadeBase: 55, variancia: 18, potencialMax: 86, nivelAgenciaRequerido: 3, raridade: 0.07 },
  { key: "veterano", nome: "Torneio de Veteranos", descricao: "Profissionais experientes ainda ativos.", categoria: "Base", tipo: "partida", custo: 420, idadeMin: 33, idadeMax: 40, qualidadeBase: 58, variancia: 16, potencialMax: 70, nivelAgenciaRequerido: 3, raridade: 0.02 },

  // Elite
  { key: "base_clube_pequeno", nome: "Base de Clube Pequeno", descricao: "Categorias de base de clubes de acesso.", categoria: "Elite", tipo: "treino", custo: 900, idadeMin: 13, idadeMax: 19, qualidadeBase: 60, variancia: 18, potencialMax: 92, nivelAgenciaRequerido: 4, raridade: 0.12 },
  { key: "base_clube_grande", nome: "Base de Clube Grande", descricao: "Categorias de base de clubes de elite.", categoria: "Elite", tipo: "treino", custo: 1600, idadeMin: 13, idadeMax: 19, qualidadeBase: 68, variancia: 18, potencialMax: 99, nivelAgenciaRequerido: 5, raridade: 0.18 },
  { key: "academia", nome: "Academia de Elite", descricao: "Centro de treinamento independente premium.", categoria: "Elite", tipo: "treino", custo: 2400, idadeMin: 15, idadeMax: 19, qualidadeBase: 72, variancia: 16, potencialMax: 99, nivelAgenciaRequerido: 5, raridade: 0.22 },
];

export const CATEGORIAS_LOCAL: LocalCategoria[] = ["Amador", "Regional", "Base", "Elite"];

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
  const g = () => clamp(Math.round(base + gaussian() * variancia * 0.5), 15, Math.min(99, potencial));
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
  const fatorIdade = j.idade < 20 ? 1.6 : j.idade < 25 ? 1.3 : j.idade < 30 ? 1.0 : j.idade < 33 ? 0.6 : 0.3;
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

  // Curva de potencial: locais mais elitizados têm chance maior de "raros"
  const roll = Math.random();
  const rar = local.raridade;
  let potencial: number;
  if (roll < rar * 0.2) {
    potencial = randi(Math.max(local.potencialMax - 4, 60), local.potencialMax);
  } else if (roll < rar) {
    potencial = randi(Math.max(local.potencialMax - 12, 55), Math.max(local.potencialMax - 4, 60));
  } else if (roll < rar + 0.25) {
    potencial = randi(45, Math.max(local.potencialMax - 12, 55));
  } else {
    potencial = randi(30, 55);
  }

  // Idade avançada não tem margem para crescer
  if (idade >= 28) potencial = Math.min(potencial, Math.max(local.qualidadeBase + 5, 50));
  if (idade >= 33) potencial = Math.min(potencial, local.qualidadeBase);

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
    ultimaTransferenciaAno: 0,
  };
  jogador.valorMercado = calcularValorMercado(jogador);
  return { jogador, counters: c2 };
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
