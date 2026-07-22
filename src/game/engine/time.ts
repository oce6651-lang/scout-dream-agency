import type { Tempo } from "../types";

export const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function semanaAbsoluta(t: Tempo): number {
  return (t.ano - 2026) * 48 + (t.mes - 1) * 4 + (t.semana - 1);
}

export function proximaSemana(t: Tempo): { tempo: Tempo; virouMes: boolean; virouAno: boolean } {
  let { ano, mes, semana } = t;
  let virouMes = false;
  let virouAno = false;
  semana += 1;
  if (semana > 4) {
    semana = 1;
    mes += 1;
    virouMes = true;
    if (mes > 12) {
      mes = 1;
      ano += 1;
      virouAno = true;
    }
  }
  return { tempo: { ano, mes, semana }, virouMes, virouAno };
}

export function formatarData(t: Tempo): string {
  return `${MESES_PT[t.mes - 1]} • Semana ${t.semana} • ${t.ano}`;
}
