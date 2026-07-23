import { chance, randi } from "../rng";
import type { Jogador } from "../types";
import { calcularValorMercado } from "./scouting";

// Called once per year for each agency-client player
export function evoluirAno(j: Jogador): Jogador {
  if (j.aposentado) return j;
  const novo: Jogador = {
    ...j,
    atributos: { ...j.atributos },
    idade: j.idade + 1,
  };
  const atributos = novo.atributos;
  const chaves = Object.keys(atributos) as (keyof typeof atributos)[];
  const media =
    chaves.reduce((s, k) => s + atributos[k], 0) / chaves.length;

  const emDeclinio = novo.idade >= 30;
  for (const k of chaves) {
    if (emDeclinio) {
      if (chance(0.6)) atributos[k] = Math.max(20, atributos[k] - randi(1, 3));
      continue;
    }
    if (atributos[k] >= novo.potencial) continue;
    const gap = novo.potencial - media;
    let ganho = 0;
    if (gap > 15) ganho = randi(2, 6);
    else if (gap > 5) ganho = randi(1, 4);
    else ganho = randi(0, 2);
    atributos[k] = Math.min(novo.potencial, atributos[k] + ganho);
  }
  novo.valorMercado = calcularValorMercado(novo);
  return novo;
}
