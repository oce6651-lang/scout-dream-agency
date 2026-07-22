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

export type Agencia = {
  id: string;
  nome: string;
  cidade: string;
  anoFundacao: number;
  nivel: number;
  reputacao: number;
};

export type Tempo = { ano: number; mes: number; semana: number };

export type FinanceEntry = {
  semanaAbs: number;
  delta: number;
  motivo: string;
};

export type SaveState = {
  version: 1;
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
};
