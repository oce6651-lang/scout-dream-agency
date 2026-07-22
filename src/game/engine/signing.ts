import type { Empresario, Jogador } from "../types";

export function chanceAssinatura(emp: Empresario, j: Jogador): number {
  let base = 0.3 + emp.prestigio * 0.05;
  // proximidade geográfica
  if (j.estado === emp.estado) base += 0.15;
  if (j.cidade === emp.cidade) base += 0.1;
  // observação
  base += j.observacaoNivel * 0.05;
  // personalidade
  if (j.personalidade === "Ambicioso" && emp.prestigio > 3) base += 0.05;
  if (j.personalidade === "Rebelde") base -= 0.1;
  if (j.personalidade === "Leal") base += 0.05;
  if (j.idade < 14) base -= 0.15; // aprovação dos responsáveis
  return Math.max(0.05, Math.min(0.95, base));
}
