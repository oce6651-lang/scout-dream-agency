import type { FacilityKey, Instalacoes } from "../types";

export const FACILITY_MAX = 5;

export const FACILITIES: {
  key: FacilityKey;
  nome: string;
  descricao: string;
  efeito: (nivel: number) => string;
}[] = [
  {
    key: "escritorio",
    nome: "Escritório",
    descricao: "Núcleo administrativo. Amplia sua capacidade de trabalho semanal.",
    efeito: (n) => `+${Math.floor(n / 2)} partida(s) assistíveis por semana`,
  },
  {
    key: "alojamento",
    nome: "Alojamento",
    descricao: "Casa atletas sem clube. Aumenta a chance de assinar contratos.",
    efeito: (n) => `+${n * 5}% na chance de assinatura`,
  },
  {
    key: "olheiros",
    nome: "Central de Olheiros",
    descricao: "Rede que descobre jogadores passivamente toda semana.",
    efeito: (n) => `~${n} descoberta(s) por semana (qualidade cresce com o nível)`,
  },
  {
    key: "analise",
    nome: "Sala de Análise",
    descricao: "Vídeo e dados de scouting. Reduz custo e melhora precisão.",
    efeito: (n) => `-${n * 10}% no custo de observação`,
  },
  {
    key: "juridico",
    nome: "Departamento Jurídico",
    descricao: "Contratos e negociações mais vantajosas.",
    efeito: (n) => `+${n}% de comissão em transferências`,
  },
];

export function instalacoesIniciais(): Instalacoes {
  return { alojamento: 0, escritorio: 0, olheiros: 0, analise: 0, juridico: 0 };
}

export function custoUpgrade(nivelAtual: number): number {
  // 0->1: 2000, 1->2: 5000, 2->3: 12000, 3->4: 28000, 4->5: 60000
  const tabela = [2000, 5000, 12000, 28000, 60000];
  return tabela[nivelAtual] ?? 999999;
}

export function nivelAgencia(inst: Instalacoes): number {
  const vals = Object.values(inst);
  const max = Math.max(0, ...vals);
  return 1 + max;
}

export function limitePartidasSemana(inst: Instalacoes): number {
  return 2 + Math.floor((inst.escritorio ?? 0) / 2);
}

export function bonusAssinatura(inst: Instalacoes): number {
  return (inst.alojamento ?? 0) * 0.05;
}

export function multiplicadorCustoObservacao(inst: Instalacoes): number {
  return Math.max(0.5, 1 - (inst.analise ?? 0) * 0.1);
}

export function bonusComissaoPct(inst: Instalacoes): number {
  return inst.juridico ?? 0;
}
