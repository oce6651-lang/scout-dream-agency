import { chance, randi } from "../rng";
import type { Jogador } from "../types";
import { calcularValorMercado } from "./scouting";

const FISICOS = ["velocidade", "fisico"] as const;

// Retorna o ganho esperado dado idade e gap até o potencial.
function ganhoBase(idade: number, gap: number): number {
  // 15-20: crescimento forte
  if (idade <= 20) {
    if (gap > 15) return randi(2, 6);
    if (gap > 5) return randi(1, 4);
    return randi(0, 2);
  }
  // 21-25: crescimento moderado
  if (idade <= 25) {
    if (gap > 15) return randi(1, 4);
    if (gap > 5) return randi(0, 3);
    return randi(0, 1);
  }
  // 26-28: crescimento marginal
  if (idade <= 28) {
    if (gap > 10) return randi(0, 2);
    return chance(0.3) ? 1 : 0;
  }
  return 0;
}

// Retorna a regressão a aplicar (número >= 0 subtraído).
function regressao(idade: number, atributo: string): number {
  const fisico = FISICOS.includes(atributo as (typeof FISICOS)[number]);
  if (idade <= 28) return 0;
  if (idade <= 31) {
    if (!fisico) return 0;
    return chance(0.4) ? randi(1, 2) : 0;
  }
  if (idade <= 34) {
    if (fisico) return chance(0.75) ? randi(1, 3) : 0;
    return chance(0.35) ? randi(0, 2) : 0;
  }
  // 35+
  if (fisico) return randi(2, 5);
  return chance(0.75) ? randi(1, 3) : 0;
}

// Called once per year for each agency-client player
export function evoluirAno(j: Jogador, bonusAnalise = 0): Jogador {
  if (j.aposentado) return j;
  const novo: Jogador = {
    ...j,
    atributos: { ...j.atributos },
    idade: j.idade + 1,
    peneirasRejeitadas: [], // reset por temporada
  };
  const atributos = novo.atributos;
  const chaves = Object.keys(atributos) as (keyof typeof atributos)[];
  const media = chaves.reduce((s, k) => s + atributos[k], 0) / chaves.length;

  for (const k of chaves) {
    const reg = regressao(novo.idade, k as string);
    if (reg > 0) {
      atributos[k] = Math.max(15, atributos[k] - reg);
      continue;
    }
    if (atributos[k] >= novo.potencial) continue;
    const gap = novo.potencial - media;
    let ganho = ganhoBase(novo.idade, gap);
    if (ganho > 0 && bonusAnalise > 0 && chance(bonusAnalise)) ganho += 1;
    atributos[k] = Math.min(novo.potencial, atributos[k] + ganho);
  }
  novo.valorMercado = calcularValorMercado(novo);
  return novo;
}
