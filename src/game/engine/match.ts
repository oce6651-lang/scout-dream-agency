import { chance, pick, randi } from "../rng";
import type { Destaque, Jogador, MatchResult, Posicao } from "../types";
import type { Local } from "./scouting";
import { overallJogador } from "./scouting";
import { makeId } from "../ids";

const TIMES_LOCAIS = [
  "Águias", "Leões", "Tigres", "Falcões", "Furacão", "Meteoros",
  "Bandeirantes", "Guarani", "Bahia", "Cruzeiro do Sul", "Sertão", "Litoral",
];

function notaBase(j: Jogador): number {
  const ovr = overallJogador(j);
  // 5.5 base + até ~2.5 pelo overall + ruído
  const n = 5.5 + (ovr / 99) * 3 + (Math.random() - 0.5) * 0.8;
  return Math.max(4.5, Math.min(9.8, Math.round(n * 10) / 10));
}

function gerarDestaquesPartida(
  jogadores: Jogador[],
  placar: [number, number],
  timeA: string,
  timeB: string,
): Destaque[] {
  const dest: Destaque[] = [];
  const [gA, gB] = placar;
  const timeAJogadores = jogadores.slice(0, 11);
  const timeBJogadores = jogadores.slice(11);
  const escolherArtilheiro = (arr: Jogador[]) => {
    const atac = arr.filter((j) => ["ATA", "MEI", "PD", "PE"].includes(j.posicao));
    const pool = atac.length ? atac : arr.filter((j) => j.posicao !== "GOL");
    // peso por finalizacao
    const total = pool.reduce((s, j) => s + j.atributos.finalizacao + 5, 0);
    let r = Math.random() * total;
    for (const j of pool) {
      r -= j.atributos.finalizacao + 5;
      if (r <= 0) return j;
    }
    return pick(pool);
  };
  for (let i = 0; i < gA; i++) {
    const j = escolherArtilheiro(timeAJogadores);
    dest.push({ minuto: randi(3, 89), texto: `Gol de ${j.nome} ${j.sobrenome} (${timeA})`, jogadorId: j.id });
  }
  for (let i = 0; i < gB; i++) {
    const j = escolherArtilheiro(timeBJogadores);
    dest.push({ minuto: randi(3, 89), texto: `Gol de ${j.nome} ${j.sobrenome} (${timeB})`, jogadorId: j.id });
  }
  // Destaques extras (jogada, defesa)
  const nExtras = randi(2, 4);
  for (let i = 0; i < nExtras; i++) {
    const j = pick(jogadores);
    const acoes = [
      `Grande jogada individual de ${j.nome}`,
      `${j.nome} rouba a bola no meio-campo`,
      `Defesa espetacular de ${j.nome}`,
      `${j.nome} arrisca de fora da área`,
      `Passe cirúrgico de ${j.nome}`,
    ];
    dest.push({ minuto: randi(3, 89), texto: pick(acoes), jogadorId: j.id });
  }
  dest.sort((a, b) => a.minuto - b.minuto);
  return dest;
}

function gerarDestaquesTreino(jogadores: Jogador[]): Destaque[] {
  const dest: Destaque[] = [];
  const top = [...jogadores]
    .sort((a, b) => overallJogador(b) - overallJogador(a))
    .slice(0, 4);
  const acoes = [
    "impressiona no rondo",
    "domina o coletivo com um golaço",
    "chama atenção pela intensidade",
    "faz jogada individual notável",
    "dá show de habilidade",
    "trabalha bem em equipe",
  ];
  for (const j of top) {
    dest.push({ minuto: 0, texto: `${j.nome} ${j.sobrenome} ${pick(acoes)}`, jogadorId: j.id });
  }
  return dest;
}

function selecionarInteressados(jogadores: Jogador[]): Set<string> {
  const scored = jogadores.map((j) => {
    const ovr = overallJogador(j);
    const nota = j.notaPartida ?? 6.5;
    const bonusJovem = j.idade < 22 ? 5 : 0;
    const bonusPot = Math.max(0, j.potencial - ovr) * 0.3;
    const score = ovr + (nota - 6) * 6 + bonusJovem + bonusPot + Math.random() * 8;
    return { id: j.id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const qtd = randi(2, 5);
  return new Set(scored.slice(0, qtd).map((s) => s.id));
}

export function simularPartida(
  counters: Record<string, number>,
  local: Local,
  jogadoresBase: Jogador[],
  semanaAbs: number,
): { partida: MatchResult; counters: Record<string, number> } {
  const { id, counters: c2 } = makeId(counters, "MTC");

  // Notas por jogador
  const jogadoresComNota: Jogador[] = jogadoresBase.map((j) => ({
    ...j,
    notaPartida: notaBase(j),
  }));

  let timeA = pick(TIMES_LOCAIS);
  let timeB = pick(TIMES_LOCAIS.filter((t) => t !== timeA));
  let destaques: Destaque[];
  let placar: [number, number] = [0, 0];

  if (local.tipo === "treino") {
    timeA = "Grupo A";
    timeB = "Grupo B";
    destaques = gerarDestaquesTreino(jogadoresComNota);
  } else {
    const forcaA = jogadoresComNota.slice(0, 11).reduce((s, j) => s + overallJogador(j), 0) / 11;
    const forcaB = jogadoresComNota.slice(11).reduce((s, j) => s + overallJogador(j), 0) / 11;
    const gA = Math.max(0, Math.round((forcaA / 25) * (0.4 + Math.random())));
    const gB = Math.max(0, Math.round((forcaB / 25) * (0.4 + Math.random())));
    placar = [Math.min(6, gA), Math.min(6, gB)];
    destaques = gerarDestaquesPartida(jogadoresComNota, placar, timeA, timeB);
  }

  // Ajusta notas: quem marcou gol ganha bônus
  for (const d of destaques) {
    if (d.jogadorId && d.texto.startsWith("Gol")) {
      const j = jogadoresComNota.find((x) => x.id === d.jogadorId);
      if (j) j.notaPartida = Math.min(9.8, (j.notaPartida ?? 6.5) + 0.4);
    }
  }

  const interessados = selecionarInteressados(jogadoresComNota);
  const jogadoresFinal = jogadoresComNota.map((j) => ({
    ...j,
    interessado: interessados.has(j.id),
  }));

  const partida: MatchResult = {
    id,
    local: local.nome,
    tipo: local.tipo,
    placar,
    timeA,
    timeB,
    jogadores: jogadoresFinal,
    destaques,
    criadaSemanaAbs: semanaAbs,
  };
  return { partida, counters: c2 };
}

// util para verificar posições genéricas de ataque (evita import)
export function _posAtaque(p: Posicao) {
  return ["ATA", "MEI", "PD", "PE"].includes(p);
}
