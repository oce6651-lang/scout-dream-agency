import type { Empresario, Jogador } from "../types";

export function chanceAssinatura(emp: Empresario, j: Jogador): number {
  let base = 0.25 + emp.prestigio * 0.03;
  // Jovem promissor confia mais em quem ofereceu o caminho
  if (j.idade < 18 && j.potencial > 75) base += 0.15;
  // Veteranos mais céticos com empresários novatos
  if (j.idade >= 30) base -= 0.1;
  if (j.idade >= 34) base -= 0.1;
  // Jogador conhecido (já teve clube) exige mais prestígio
  if (j.clubeAtualId || j.historicoCarreira.length > 0) {
    base -= 0.15;
    base += emp.prestigio * 0.02;
  }
  // proximidade geográfica
  if (j.estado === emp.estado) base += 0.12;
  if (j.cidade === emp.cidade) base += 0.08;
  // observação
  base += j.observacaoNivel * 0.05;
  // personalidade
  if (j.personalidade === "Ambicioso" && emp.prestigio > 3) base += 0.05;
  if (j.personalidade === "Rebelde") base -= 0.1;
  if (j.personalidade === "Leal") base += 0.05;
  if (j.idade < 14) base -= 0.2; // aprovação dos responsáveis
  return Math.max(0.03, Math.min(0.95, base));
}
