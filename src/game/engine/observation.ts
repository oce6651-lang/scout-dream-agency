import type { Jogador } from "../types";

export const NIVEIS_OBSERVACAO = [
  { nivel: 1 as const, nome: "Relatório inicial", custo: 100, descricao: "Reconhecimento geral. Faixa aproximada do potencial." },
  { nivel: 2 as const, nome: "Relatório técnico", custo: 300, descricao: "Análise detalhada. Faixa estreita e atributos confirmados." },
  { nivel: 3 as const, nome: "Relatório completo", custo: 800, descricao: "Dossiê completo. Potencial exato revelado." },
];

export function aplicarObservacao(j: Jogador, nivel: 1 | 2 | 3): Jogador {
  const novo = { ...j, observacaoNivel: Math.max(j.observacaoNivel, nivel) as 1 | 2 | 3 };
  novo.potencialConhecido = nivel === 3 ? "exato" : nivel === 2 ? "faixa" : "estimativa";
  return novo;
}

export function textoPotencial(j: Jogador): string {
  if (j.potencialConhecido === "none") return "Desconhecido";
  if (j.potencialConhecido === "exato") return `${j.potencial}`;
  if (j.potencialConhecido === "faixa") {
    const min = Math.max(40, j.potencial - 5);
    const max = Math.min(99, j.potencial + 5);
    return `${min}–${max}`;
  }
  // estimativa - larga
  const min = Math.max(40, j.potencial - 12);
  const max = Math.min(99, j.potencial + 12);
  return `${min}–${max}`;
}
