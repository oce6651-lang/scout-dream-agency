import { chance, pick, randi } from "../rng";
import { makeId } from "../ids";
import type { Clube, Empresario, Jogador, Proposta } from "../types";

export function gerarPropostasSemana(
  counters: Record<string, number>,
  jogadoresAgencia: Jogador[],
  clubes: Clube[],
  emp: Empresario,
  semanaAbs: number,
): { propostas: Proposta[]; counters: Record<string, number> } {
  const propostas: Proposta[] = [];
  let c = counters;
  for (const j of jogadoresAgencia) {
    const mediaAtr =
      (j.atributos.velocidade + j.atributos.passe + j.atributos.finalizacao + j.atributos.defesa + j.atributos.fisico + j.atributos.tecnica + j.atributos.mental) / 7;
    // Chance base cresce com atributos e prestígio do empresário
    const chancePropose = Math.min(0.5, 0.02 + mediaAtr / 300 + emp.prestigio * 0.01);
    if (!chance(chancePropose)) continue;

    // filtra clubes por compatibilidade de nível
    const nivelJogador = mediaAtr / 10; // 0-10
    const candidatos = clubes.filter((cl) => Math.abs(cl.nivel - nivelJogador) <= 3);
    if (candidatos.length === 0) continue;
    const clube = pick(candidatos);

    const valorBase = j.valorMercado;
    const valor = Math.round(valorBase * (0.7 + Math.random() * 0.7));
    const salario = Math.round(valor * 0.02) + randi(1000, 8000);
    const comissao = randi(8, 15);
    const { id, counters: c2 } = makeId(c, "OFR");
    c = c2;
    propostas.push({
      id,
      clubeId: clube.id,
      jogadorId: j.id,
      valor,
      salario,
      comissaoPct: comissao,
      criadaSemanaAbs: semanaAbs,
      expiraSemanaAbs: semanaAbs + 4,
    });
  }
  return { propostas, counters: c };
}
