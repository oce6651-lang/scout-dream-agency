export type Posicao =
  | "GOL"
  | "ZAG"
  | "LD"
  | "LE"
  | "VOL"
  | "MC"
  | "MEI"
  | "PD"
  | "PE"
  | "ATA";

export const POSICOES: Posicao[] = [
  "GOL",
  "ZAG",
  "LD",
  "LE",
  "VOL",
  "MC",
  "MEI",
  "PD",
  "PE",
  "ATA",
];

export type PeDominante = "Destro" | "Canhoto" | "Ambidestro";

export type Personalidade =
  | "Ambicioso"
  | "Leal"
  | "Ganancioso"
  | "Discreto"
  | "Trabalhador"
  | "Rebelde";

export type Atributos = {
  velocidade: number;
  passe: number;
  finalizacao: number;
  defesa: number;
  fisico: number;
  tecnica: number;
  mental: number;
};

export type HistoricoEntry = {
  ano: number;
  mes: number;
  semana: number;
  texto: string;
};

export type Categoria =
  | "Sub-15"
  | "Sub-17"
  | "Sub-20"
  | "Sub-23"
  | "Profissional"
  | "Veterano"
  | "Aposentado";

export type CareerYear = {
  ano: number;
  idade: number;
  clubeId: string | null;
  clubeNome: string;
  categoria: Categoria;
  jogos: number;
  gols: number;
  assistencias: number;
  overall: number;
};

export type Jogador = {
  id: string;
  nome: string;
  sobrenome: string;
  idade: number;
  nacionalidade: string;
  estado: string;
  cidade: string;
  posicao: Posicao;
  peDominante: PeDominante;
  clubeAtualId: string | null;
  empresarioId: string | null;
  potencial: number;
  potencialConhecido: "none" | "estimativa" | "faixa" | "exato";
  observacaoNivel: 0 | 1 | 2 | 3;
  atributos: Atributos;
  personalidade: Personalidade;
  salario: number;
  valorMercado: number;
  historico: HistoricoEntry[];
  historicoCarreira: CareerYear[];
  /** ano da última transferência (limita 1 por ano). 0 = nunca. */
  ultimaTransferenciaAno: number;
  /** clubes que já rejeitaram este atleta em peneiras nesta temporada. */
  peneirasRejeitadas?: string[];
  // Match-only ephemeral fields
  interessado?: boolean;
  notaPartida?: number;
  aposentado?: boolean;
};

export type Clube = {
  id: string;
  nome: string;
  pais: string;
  cidade?: string;
  nivel: number; // 1-10
  orcamento: number;
  categoria: "base" | "principal" | "gigante";
};

export type Proposta = {
  id: string;
  clubeId: string;
  jogadorId: string;
  valor: number;
  salario: number;
  comissaoPct: number;
  criadaSemanaAbs: number;
  expiraSemanaAbs: number;
};

export type Noticia = {
  id: string;
  semanaAbs: number;
  titulo: string;
  corpo: string;
  tipo: "info" | "alerta" | "sucesso";
};

export type Funcionario = {
  id: string;
  tipo: "olheiro" | "advogado" | "assistente";
  nome: string;
  nivel: number;
  salario: number;
};

export type Empresario = {
  id: string;
  nome: string;
  sobrenome: string;
  idade: number;
  nacionalidade: string;
  estado: string;
  cidade: string;
  agenciaId: string;
  dinheiro: number;
  prestigio: number;
  nivel: number;
  experiencia: number;
};

export type FacilityKey =
  | "alojamento"
  | "escritorio"
  | "olheiros"
  | "analise"
  | "juridico";

export type Instalacoes = Record<FacilityKey, number>;

export type Agencia = {
  id: string;
  nome: string;
  cidade: string;
  anoFundacao: number;
  nivel: number;
  reputacao: number;
  instalacoes: Instalacoes;
};

export type Tempo = { ano: number; mes: number; semana: number };

export type FinanceEntry = {
  semanaAbs: number;
  delta: number;
  motivo: string;
};

export type Destaque = { minuto: number; texto: string; jogadorId?: string };

export type MatchResult = {
  id: string;
  local: string;
  tipo: "partida" | "treino";
  placar: [number, number];
  timeA: string;
  timeB: string;
  jogadores: Jogador[];
  destaques: Destaque[];
  criadaSemanaAbs: number;
};

export type YearEndPlayerDelta = {
  jogadorId: string;
  nome: string;
  antes: { idade: number; overall: number; categoria: Categoria; clubeNome: string };
  depois: { idade: number; overall: number; categoria: Categoria; clubeNome: string };
  deltasAtributos: Partial<Atributos>;
  aposentou: boolean;
  mudouCategoria: boolean;
};

export type YearEndClubeDelta = {
  clubeId: string;
  nome: string;
  antesNivel: number;
  depoisNivel: number;
};

export type YearEndResumo = {
  ano: number;
  jogadores: YearEndPlayerDelta[];
  clubes: YearEndClubeDelta[];
  balanco: { entradas: number; saidas: number; lucro: number };
};

export type SaveState = {
  version: 2;
  empresario: Empresario;
  agencia: Agencia;
  jogadores: Jogador[];
  clubes: Clube[];
  propostas: Proposta[];
  noticias: Noticia[];
  funcionarios: Funcionario[];
  tempo: Tempo;
  counters: Record<string, number>;
  finance: FinanceEntry[];
  seed: number;
  lastSavedAt: number;
  assistidosNaSemana: number;
  ultimaPartida: MatchResult | null;
  resumoPendente: YearEndResumo | null;
};
