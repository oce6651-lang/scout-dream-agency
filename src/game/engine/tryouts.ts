import { chance, pick, randi } from "../rng";
import { makeId } from "../ids";
import type { Clube, Empresario, Jogador, Proposta } from "../types";

function overall(j: Jogador): number {
  const a = j.atributos;
  return (a.velocidade + a.passe + a.finalizacao + a.defesa + a.fisico + a.tecnica + a.mental) / 7;
}

export type PeneiraOpcao = {
  clubeId: string;
  clubeNome: string;
  nivelClube: number;
  custo: number;
  chance: number;
};

export function listarPeneirasParaJogador(
  j: Jogador,
  clubes: Clube[],
  emp: Empresario,
  bonusInstalacao: number,
): PeneiraOpcao[] {
  const ov = overall(j);
  const rejeitados = new Set(j.peneirasRejeitadas ?? []);

  // Faixa de clube alcançável: começa pequeno, sobe com o overall e prestígio
  const tetoNivel = Math.min(10, Math.floor(ov / 10) + 1 + Math.floor(emp.prestigio / 10));
  // Piso: evitar peneira em clube muito abaixo do jogador
  const pisoNivel = Math.max(1, Math.floor(ov / 12) - 1);

  const candidatos = clubes.filter(
    (c) =>
      c.nivel <= tetoNivel &&
      c.nivel >= pisoNivel &&
      c.id !== j.clubeAtualId &&
      !rejeitados.has(c.id),
  );

  return candidatos.map((c) => {
    const nivelClube = c.nivel * 10;
    const diff = ov - nivelClube; // >0: jogador acima do nível do clube
    // Base: 25% + ajuste por diferença
    let ch = 0.25 + diff * 0.02;
    ch += (j.observacaoNivel ?? 0) * 0.03;
    if (j.idade < 20) ch += 0.05;
    if (j.idade >= 30) ch -= 0.1;
    if (j.idade >= 34) ch -= 0.15;
    ch += bonusInstalacao;
    // Clubes muito acima do jogador ficam bem duros
    if (c.nivel >= 8) ch -= 0.15;
    if (c.nivel >= 9) ch -= 0.1;
    ch = Math.max(0.03, Math.min(0.85, ch));

    // Custo escala com o nível do clube
    const custo = Math.round(300 + Math.pow(c.nivel, 2) * 80);
    return {
      clubeId: c.id,
      clubeNome: c.nome,
      nivelClube: c.nivel,
      custo,
      chance: ch,
    };
  }).sort((a, b) => b.nivelClube - a.nivelClube).slice(0, 6);
}

export function limitePeneirasSemana(nivelAgencia: number): number {
  return 1 + Math.floor(nivelAgencia / 2);
}

/** Tenta a peneira e devolve resultado + proposta gerada se aprovado. */
export function resolverPeneira(
  counters: Record<string, number>,
  j: Jogador,
  clube: Clube,
  opcao: PeneiraOpcao,
  semanaAbs: number,
): {
  aprovado: boolean;
  proposta: Proposta | null;
  counters: Record<string, number>;
} {
  const aprovado = chance(opcao.chance);
  if (!aprovado) {
    return { aprovado: false, proposta: null, counters };
  }
  // Proposta modesta — clube pequeno correndo risco com jogador novo
  const ov = overall(j);
  const valorBase = Math.round(Math.pow(ov, 2.2) * 5 * (1 + clube.nivel / 15));
  const valor = Math.round(valorBase * (0.4 + Math.random() * 0.4));
  const salario = Math.round(valor * 0.02) + randi(500, 3000);
  const comissao = randi(5, 10); // menor que mercado espontâneo
  const { id, counters: c2 } = makeId(counters, "OFR");
  const proposta: Proposta = {
    id,
    clubeId: clube.id,
    jogadorId: j.id,
    valor,
    salario,
    comissaoPct: comissao,
    criadaSemanaAbs: semanaAbs,
    expiraSemanaAbs: semanaAbs + 3,
  };
  return { aprovado: true, proposta, counters: c2 };
}

export { pick };
