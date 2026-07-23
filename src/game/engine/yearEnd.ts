import type {
  Categoria,
  CareerYear,
  Clube,
  Jogador,
  Posicao,
  YearEndClubeDelta,
  YearEndPlayerDelta,
  YearEndResumo,
} from "../types";
import { overallJogador } from "./scouting";
import { chance, randi } from "../rng";

export function categoriaDeIdade(idade: number, aposentado?: boolean): Categoria {
  if (aposentado) return "Aposentado";
  if (idade < 15) return "Sub-15";
  if (idade < 17) return "Sub-17";
  if (idade < 20) return "Sub-20";
  if (idade < 23) return "Sub-23";
  if (idade < 33) return "Profissional";
  return "Veterano";
}

const POS_GOL: Record<Posicao, number> = {
  GOL: 0, ZAG: 0.04, LD: 0.07, LE: 0.07, VOL: 0.05, MC: 0.12, MEI: 0.22, PD: 0.28, PE: 0.28, ATA: 0.5,
};
const POS_AST: Record<Posicao, number> = {
  GOL: 0, ZAG: 0.04, LD: 0.15, LE: 0.15, VOL: 0.1, MC: 0.2, MEI: 0.3, PD: 0.25, PE: 0.25, ATA: 0.15,
};

export function gerarCareerYear(
  j: Jogador,
  ano: number,
  clube: Clube | null,
): CareerYear {
  const ovr = overallJogador(j);
  const cat = categoriaDeIdade(j.idade, j.aposentado);
  let jogos = 0;
  let gols = 0;
  let assistencias = 0;

  if (!j.aposentado && j.idade >= 14) {
    const baseJogos =
      cat === "Sub-15" ? 8 :
      cat === "Sub-17" ? 18 :
      cat === "Sub-20" ? 25 :
      cat === "Sub-23" ? 30 :
      cat === "Veterano" ? 18 : 36;
    const fatorOvr = 0.6 + (ovr / 99) * 0.8;
    jogos = clube ? Math.max(0, Math.round(baseJogos * fatorOvr * (0.8 + Math.random() * 0.4))) : Math.round(baseJogos * 0.3 * Math.random());
    const golBase = POS_GOL[j.posicao] * (ovr / 70) * (0.7 + Math.random() * 0.6);
    const astBase = POS_AST[j.posicao] * (ovr / 70) * (0.7 + Math.random() * 0.6);
    gols = Math.round(jogos * golBase);
    assistencias = Math.round(jogos * astBase);
  }

  return {
    ano,
    idade: j.idade,
    clubeId: clube?.id ?? null,
    clubeNome: clube?.nome ?? (j.aposentado ? "—" : "Sem clube"),
    categoria: cat,
    jogos,
    gols,
    assistencias,
    overall: ovr,
  };
}

// Aplica envelhecimento, evolução (delegado externamente), aposentadoria e monta o resumo
export function calcularResumoAno(params: {
  ano: number;
  jogadoresAntes: Jogador[];
  jogadoresDepois: Jogador[]; // já com idade+1, atributos evoluídos
  clubesAntes: Clube[];
  clubesDepois: Clube[];
  balanco: { entradas: number; saidas: number };
}): YearEndResumo {
  const { ano, jogadoresAntes, jogadoresDepois, clubesAntes, clubesDepois, balanco } = params;

  const jogadoresDelta: YearEndPlayerDelta[] = [];
  for (const antes of jogadoresAntes) {
    const depois = jogadoresDepois.find((j) => j.id === antes.id);
    if (!depois) continue;
    const clubeAntes = clubesAntes.find((c) => c.id === antes.clubeAtualId);
    const clubeDepois = clubesDepois.find((c) => c.id === depois.clubeAtualId);
    const catAntes = categoriaDeIdade(antes.idade, antes.aposentado);
    const catDepois = categoriaDeIdade(depois.idade, depois.aposentado);
    const deltas: Partial<typeof antes.atributos> = {};
    for (const k of Object.keys(antes.atributos) as (keyof typeof antes.atributos)[]) {
      const d = depois.atributos[k] - antes.atributos[k];
      if (d !== 0) deltas[k] = d;
    }
    jogadoresDelta.push({
      jogadorId: antes.id,
      nome: `${antes.nome} ${antes.sobrenome}`,
      antes: {
        idade: antes.idade,
        overall: overallJogador(antes),
        categoria: catAntes,
        clubeNome: clubeAntes?.nome ?? "Sem clube",
      },
      depois: {
        idade: depois.idade,
        overall: overallJogador(depois),
        categoria: catDepois,
        clubeNome: clubeDepois?.nome ?? (depois.aposentado ? "Aposentado" : "Sem clube"),
      },
      deltasAtributos: deltas,
      aposentou: !antes.aposentado && !!depois.aposentado,
      mudouCategoria: catAntes !== catDepois,
    });
  }

  const clubesDelta: YearEndClubeDelta[] = [];
  for (const antes of clubesAntes) {
    const depois = clubesDepois.find((c) => c.id === antes.id);
    if (!depois || depois.nivel === antes.nivel) continue;
    clubesDelta.push({
      clubeId: antes.id,
      nome: antes.nome,
      antesNivel: antes.nivel,
      depoisNivel: depois.nivel,
    });
  }

  return {
    ano,
    jogadores: jogadoresDelta,
    clubes: clubesDelta,
    balanco: { ...balanco, lucro: balanco.entradas - balanco.saidas },
  };
}

// Pequeno "vai e vem" de clubes (promoção/rebaixamento simbólico)
export function embaralharClubes(clubes: Clube[]): Clube[] {
  return clubes.map((c) => {
    if (!chance(0.15)) return c;
    const delta = chance(0.5) ? 1 : -1;
    const novoNivel = Math.max(1, Math.min(10, c.nivel + delta));
    return { ...c, nivel: novoNivel };
  });
}

// Chance de aposentadoria por idade
export function tentarAposentar(j: Jogador): Jogador {
  if (j.aposentado) return j;
  if (j.idade < 34) return j;
  const p = j.idade >= 40 ? 0.9 : j.idade >= 37 ? 0.5 : j.idade >= 35 ? 0.25 : 0.1;
  if (chance(p)) return { ...j, aposentado: true, clubeAtualId: null, salario: 0 };
  return j;
}

// Wrap para chamar geração de career year para todos jogadores da agência
export function anexarCareerYear(
  jogadores: Jogador[],
  ano: number,
  clubes: Clube[],
  empresarioId: string,
): Jogador[] {
  return jogadores.map((j) => {
    if (j.empresarioId !== empresarioId) return j;
    const clube = clubes.find((c) => c.id === j.clubeAtualId) ?? null;
    const cy = gerarCareerYear(j, ano, clube);
    return { ...j, historicoCarreira: [...j.historicoCarreira, cy] };
  });
}

// Util fake para satisfazer o compilador de que randi está sendo usado (se necessário)
export const _keep = randi;
