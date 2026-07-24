import { chance, pick, randi } from "../rng";
import { makeId } from "../ids";
import type { Clube, Empresario, Jogador, Proposta } from "../types";

function overall(j: Jogador): number {
  const a = j.atributos;
  return (a.velocidade + a.passe + a.finalizacao + a.defesa + a.fisico + a.tecnica + a.mental) / 7;
}

function conhecido(j: Jogador): boolean {
  return (
    j.observacaoNivel >= 1 ||
    j.historicoCarreira.length > 0 ||
    j.clubeAtualId !== null
  );
}

export function gerarPropostasSemana(
  counters: Record<string, number>,
  jogadoresAgencia: Jogador[],
  clubes: Clube[],
  emp: Empresario,
  semanaAbs: number,
  anoAtual: number,
): { propostas: Proposta[]; counters: Record<string, number> } {
  const propostas: Proposta[] = [];
  let c = counters;

  for (const j of jogadoresAgencia) {
    // Já se transferiu este ano? Sem propostas.
    if (j.ultimaTransferenciaAno === anoAtual) continue;
    // Desconhecidos: só via peneiras.
    if (!conhecido(j)) continue;

    const ov = overall(j);
    const nivelJogador = ov / 10; // 0-10
    // Idade pesa muito: veteranos raramente recebem
    let fatorIdade = 1;
    if (j.idade >= 30) fatorIdade = 0.5;
    if (j.idade >= 33) fatorIdade = 0.25;
    if (j.idade >= 36) fatorIdade = 0.1;

    // Chance base menor + reduzida por prestígio baixo
    const chancePropose = Math.min(
      0.25,
      (0.005 + ov / 900 + emp.prestigio * 0.004) * fatorIdade,
    );
    if (!chance(chancePropose)) continue;

    // Filtro estrito de nível de clube
    let candidatos = clubes.filter((cl) => Math.abs(cl.nivel - nivelJogador) <= 2);
    // Clubes grandes só entram para atletas topo
    candidatos = candidatos.filter((cl) => (cl.nivel >= 8 ? ov >= 75 : true));
    // Clubes gigantes exigem prestígio mínimo do empresário
    candidatos = candidatos.filter((cl) => (cl.nivel >= 9 ? emp.prestigio >= 15 : true));
    if (candidatos.length === 0) continue;

    const clube = pick(candidatos);
    if (clube.id === j.clubeAtualId) continue;

    const valorBase = j.valorMercado;
    const valor = Math.round(valorBase * (0.6 + Math.random() * 0.6));
    const salario = Math.round(valor * 0.02) + randi(800, 6000);
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
