import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Agencia,
  Empresario,
  FacilityKey,
  FinanceEntry,
  Funcionario,
  Jogador,
  SaveState,
  YearEndResumo,
} from "./types";
import { makeId } from "./ids";
import { CLUBES_SEED } from "./data/clubes";
import { proximaSemana, semanaAbsoluta } from "./engine/time";
import {
  LOCAIS,
  type LocalKey,
  getLocal,
  gerarPartidaTimes,
  gerarTreino,
  gerarJogador,
} from "./engine/scouting";
import { simularPartida } from "./engine/match";
import {
  FACILITIES,
  bonusAssinatura,
  bonusComissaoPct,
  custoUpgrade,
  FACILITY_MAX,
  instalacoesIniciais,
  limitePartidasSemana,
  multiplicadorCustoObservacao,
  nivelAgencia,
} from "./engine/facilities";
import { aplicarObservacao, NIVEIS_OBSERVACAO } from "./engine/observation";
import { chanceAssinatura } from "./engine/signing";
import { evoluirAno } from "./engine/evolution";
import {
  anexarCareerYear,
  calcularResumoAno,
  embaralharClubes,
  tentarAposentar,
} from "./engine/yearEnd";
import { gerarPropostasSemana } from "./engine/market";
import { criarNoticia } from "./engine/news";
import { chance, randi } from "./rng";

type Rascunho = {
  save: SaveState | null;
};

type Actions = {
  novoJogo: (input: {
    nome: string;
    sobrenome: string;
    nacionalidade: string;
    estado: string;
    cidade: string;
    nomeAgencia: string;
  }) => void;
  reset: () => void;
  temSave: () => boolean;

  assistirLocal: (localKey: LocalKey) => { ok: boolean; msg?: string; partidaId?: string };
  observar: (jogadorId: string, nivel: 1 | 2 | 3) => { ok: boolean; msg?: string };
  assinar: (jogadorId: string) => { ok: boolean; msg: string };

  melhorarInstalacao: (key: FacilityKey) => { ok: boolean; msg: string };

  responderProposta: (
    propostaId: string,
    acao: "aceitar" | "recusar" | "negociar",
  ) => { ok: boolean; msg: string };

  contratarFuncionario: (tipo: Funcionario["tipo"]) => { ok: boolean; msg: string };
  demitirFuncionario: (id: string) => void;

  avancarSemana: () => { eventos: string[]; resumo: YearEndResumo | null };
  limparResumo: () => void;
};

type Store = Rascunho & Actions;

function calcularNivelPrestigio(prestigio: number): number {
  return Math.max(1, Math.floor(prestigio / 10) + 1);
}

// Re-exports para conveniência de rotas
export { LOCAIS, FACILITIES, custoUpgrade, FACILITY_MAX, NIVEIS_OBSERVACAO };

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      save: null,

      temSave: () => get().save !== null,

      novoJogo: (input) => {
        let counters: Record<string, number> = {};
        const { id: agtId, counters: c1 } = makeId(counters, "AGT");
        counters = c1;
        const { id: agnId, counters: c2 } = makeId(counters, "AGN");
        counters = c2;

        const empresario: Empresario = {
          id: agtId,
          nome: input.nome,
          sobrenome: input.sobrenome,
          idade: 25,
          nacionalidade: input.nacionalidade,
          estado: input.estado,
          cidade: input.cidade,
          agenciaId: agnId,
          dinheiro: 2000,
          prestigio: 1,
          nivel: 1,
          experiencia: 0,
        };
        const instalacoes = instalacoesIniciais();
        const agencia: Agencia = {
          id: agnId,
          nome: input.nomeAgencia,
          cidade: input.cidade,
          anoFundacao: 2026,
          nivel: nivelAgencia(instalacoes),
          reputacao: 1,
          instalacoes,
        };
        const save: SaveState = {
          version: 2,
          empresario,
          agencia,
          jogadores: [],
          clubes: CLUBES_SEED,
          propostas: [],
          noticias: [
            {
              id: "NWS000000",
              semanaAbs: 0,
              titulo: "Uma nova agência entra em cena",
              corpo: `${input.nomeAgencia} foi fundada em ${input.cidade}. Um novo capítulo começa.`,
              tipo: "info",
            },
          ],
          funcionarios: [],
          tempo: { ano: 2026, mes: 3, semana: 1 },
          counters,
          finance: [],
          seed: Date.now() & 0xffffffff,
          lastSavedAt: Date.now(),
          assistidosNaSemana: 0,
          ultimaPartida: null,
          resumoPendente: null,
        };
        set({ save });
      },

      reset: () => set({ save: null }),

      assistirLocal: (localKey) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const local = getLocal(localKey);
        if (!local) return { ok: false, msg: "Local inválido" };
        if (local.nivelAgenciaRequerido > s.agencia.nivel) {
          return { ok: false, msg: `Requer agência nível ${local.nivelAgenciaRequerido}` };
        }
        const limite = limitePartidasSemana(s.agencia.instalacoes);
        if (s.assistidosNaSemana >= limite) {
          return { ok: false, msg: `Limite semanal (${limite}) atingido. Avance a semana.` };
        }
        if (s.empresario.dinheiro < local.custo) {
          return { ok: false, msg: "Dinheiro insuficiente" };
        }

        // Gerar atletas
        let counters = s.counters;
        const ctx = { estadoPreferido: s.empresario.estado };
        const gen = local.tipo === "partida"
          ? gerarPartidaTimes(counters, local, ctx)
          : gerarTreino(counters, local, ctx);
        counters = gen.counters;

        // Simular
        const semanaAbs = semanaAbsoluta(s.tempo);
        const sim = simularPartida(counters, local, gen.jogadores, semanaAbs);
        counters = sim.counters;

        const finance: FinanceEntry[] = [
          ...s.finance,
          { semanaAbs, delta: -local.custo, motivo: `Ida ao ${local.nome}` },
        ];

        set({
          save: {
            ...s,
            counters,
            finance,
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - local.custo },
            assistidosNaSemana: s.assistidosNaSemana + 1,
            ultimaPartida: sim.partida,
            lastSavedAt: Date.now(),
          },
        });
        return { ok: true, partidaId: sim.partida.id };
      },

      observar: (jogadorId, nivel) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const info = NIVEIS_OBSERVACAO.find((n) => n.nivel === nivel)!;
        const mult = multiplicadorCustoObservacao(s.agencia.instalacoes);
        const custo = Math.round(info.custo * mult);
        if (s.empresario.dinheiro < custo) return { ok: false, msg: "Dinheiro insuficiente" };

        const partida = s.ultimaPartida;
        const idxPartida = partida?.jogadores.findIndex((j) => j.id === jogadorId) ?? -1;
        const idxOwn = s.jogadores.findIndex((j) => j.id === jogadorId);
        if (idxPartida < 0 && idxOwn < 0) return { ok: false, msg: "Jogador não encontrado" };

        const semanaAbs = semanaAbsoluta(s.tempo);
        let novaPartida = partida;
        let novosJogadores = s.jogadores;
        if (idxPartida >= 0 && partida) {
          const arr = [...partida.jogadores];
          arr[idxPartida] = aplicarObservacao(arr[idxPartida], nivel);
          novaPartida = { ...partida, jogadores: arr };
        }
        if (idxOwn >= 0) {
          const arr = [...s.jogadores];
          arr[idxOwn] = aplicarObservacao(arr[idxOwn], nivel);
          novosJogadores = arr;
        }

        set({
          save: {
            ...s,
            jogadores: novosJogadores,
            ultimaPartida: novaPartida,
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - custo },
            finance: [
              ...s.finance,
              { semanaAbs, delta: -custo, motivo: `Observação ${info.nome}` },
            ],
            lastSavedAt: Date.now(),
          },
        });
        return { ok: true };
      },

      assinar: (jogadorId) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const partida = s.ultimaPartida;
        const jogador = partida?.jogadores.find((j) => j.id === jogadorId);
        if (!jogador) return { ok: false, msg: "Atleta não está mais disponível" };
        if (!jogador.interessado) return { ok: false, msg: "Atleta não demonstrou interesse" };
        if (s.jogadores.some((j) => j.id === jogadorId)) return { ok: false, msg: "Já é seu cliente" };

        let p = chanceAssinatura(s.empresario, jogador);
        p = Math.min(0.98, p + bonusAssinatura(s.agencia.instalacoes));
        const semanaAbs = semanaAbsoluta(s.tempo);
        if (chance(p)) {
          const novoCliente: Jogador = {
            ...jogador,
            empresarioId: s.empresario.id,
            interessado: false,
            historico: [
              ...jogador.historico,
              {
                ano: s.tempo.ano,
                mes: s.tempo.mes,
                semana: s.tempo.semana,
                texto: `Descoberto e assinado por ${s.agencia.nome}`,
              },
            ],
          };
          const { noticia, counters } = criarNoticia(
            s.counters,
            semanaAbs,
            "Nova contratação",
            `${s.agencia.nome} assinou com ${jogador.nome} ${jogador.sobrenome} (${jogador.idade} anos, ${jogador.posicao}).`,
            "sucesso",
          );
          const empresario: Empresario = {
            ...s.empresario,
            experiencia: s.empresario.experiencia + 20,
            prestigio: s.empresario.prestigio + 1,
          };
          empresario.nivel = calcularNivelPrestigio(empresario.prestigio);
          const partidaRestante = partida
            ? {
                ...partida,
                jogadores: partida.jogadores.filter((j) => j.id !== jogadorId),
              }
            : null;
          set({
            save: {
              ...s,
              jogadores: [...s.jogadores, novoCliente],
              noticias: [noticia, ...s.noticias],
              counters,
              empresario,
              ultimaPartida: partidaRestante,
              lastSavedAt: Date.now(),
            },
          });
          return { ok: true, msg: `Contrato assinado com ${jogador.nome}!` };
        } else {
          return { ok: false, msg: `${jogador.nome} recusou a proposta.` };
        }
      },

      melhorarInstalacao: (key) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const atual = s.agencia.instalacoes[key] ?? 0;
        if (atual >= FACILITY_MAX) return { ok: false, msg: "Nível máximo atingido" };
        const custo = custoUpgrade(atual);
        if (s.empresario.dinheiro < custo) return { ok: false, msg: "Dinheiro insuficiente" };
        const novasInst = { ...s.agencia.instalacoes, [key]: atual + 1 };
        const semanaAbs = semanaAbsoluta(s.tempo);
        set({
          save: {
            ...s,
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - custo },
            agencia: {
              ...s.agencia,
              instalacoes: novasInst,
              nivel: nivelAgencia(novasInst),
            },
            finance: [
              ...s.finance,
              { semanaAbs, delta: -custo, motivo: `Upgrade instalação (${key})` },
            ],
            lastSavedAt: Date.now(),
          },
        });
        return { ok: true, msg: `Instalação melhorada para nível ${atual + 1}` };
      },

      responderProposta: (propostaId, acao) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const proposta = s.propostas.find((p) => p.id === propostaId);
        if (!proposta) return { ok: false, msg: "Proposta não encontrada" };
        const jogador = s.jogadores.find((j) => j.id === proposta.jogadorId);
        const clube = s.clubes.find((c) => c.id === proposta.clubeId);
        if (!jogador || !clube) return { ok: false, msg: "Dados inválidos" };
        const semanaAbs = semanaAbsoluta(s.tempo);

        if (acao === "recusar") {
          set({
            save: {
              ...s,
              propostas: s.propostas.filter((p) => p.id !== propostaId),
              lastSavedAt: Date.now(),
            },
          });
          return { ok: true, msg: "Proposta recusada." };
        }
        if (acao === "negociar") {
          if (chance(0.55)) {
            const bump = 1 + (10 + Math.random() * 20) / 100;
            const nova = {
              ...proposta,
              valor: Math.round(proposta.valor * bump),
              salario: Math.round(proposta.salario * bump),
              expiraSemanaAbs: semanaAbs + 3,
            };
            set({
              save: {
                ...s,
                propostas: s.propostas.map((p) => (p.id === propostaId ? nova : p)),
                lastSavedAt: Date.now(),
              },
            });
            return {
              ok: true,
              msg: `Contraproposta aceita: R$ ${nova.valor.toLocaleString("pt-BR")}`,
            };
          } else {
            set({
              save: {
                ...s,
                propostas: s.propostas.filter((p) => p.id !== propostaId),
                lastSavedAt: Date.now(),
              },
            });
            return { ok: false, msg: `${clube.nome} desistiu do negócio.` };
          }
        }
        const bonusPct = bonusComissaoPct(s.agencia.instalacoes);
        const comissao = Math.round((proposta.valor * (proposta.comissaoPct + bonusPct)) / 100);
        const jogadorAtualizado: Jogador = {
          ...jogador,
          clubeAtualId: clube.id,
          salario: proposta.salario,
          historico: [
            ...jogador.historico,
            {
              ano: s.tempo.ano,
              mes: s.tempo.mes,
              semana: s.tempo.semana,
              texto: `Transferido para ${clube.nome} por R$ ${proposta.valor.toLocaleString("pt-BR")}`,
            },
          ],
        };
        const { noticia, counters } = criarNoticia(
          s.counters,
          semanaAbs,
          "Transferência confirmada",
          `${jogador.nome} ${jogador.sobrenome} assinou com ${clube.nome}. Comissão: R$ ${comissao.toLocaleString("pt-BR")}.`,
          "sucesso",
        );
        const empresario: Empresario = {
          ...s.empresario,
          dinheiro: s.empresario.dinheiro + comissao,
          prestigio: s.empresario.prestigio + Math.max(1, Math.round(clube.nivel / 2)),
          experiencia: s.empresario.experiencia + 30,
        };
        empresario.nivel = calcularNivelPrestigio(empresario.prestigio);
        set({
          save: {
            ...s,
            empresario,
            jogadores: s.jogadores.map((j) => (j.id === jogador.id ? jogadorAtualizado : j)),
            propostas: s.propostas.filter((p) => p.id !== propostaId && p.jogadorId !== jogador.id),
            noticias: [noticia, ...s.noticias],
            counters,
            finance: [
              ...s.finance,
              { semanaAbs, delta: comissao, motivo: `Comissão ${jogador.nome} → ${clube.nome}` },
            ],
            lastSavedAt: Date.now(),
          },
        });
        return { ok: true, msg: `Transferência fechada! +R$ ${comissao.toLocaleString("pt-BR")}` };
      },

      contratarFuncionario: (tipo) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const custoInicial = { olheiro: 1500, advogado: 1200, assistente: 800 }[tipo];
        const salario = { olheiro: 400, advogado: 350, assistente: 200 }[tipo];
        if (s.empresario.dinheiro < custoInicial) return { ok: false, msg: "Dinheiro insuficiente" };
        const { id, counters } = makeId(s.counters, "STF");
        const nomes = ["Carlos", "Ana", "Marcos", "Júlia", "Roberto", "Beatriz"];
        const sobs = ["Souza", "Lima", "Ferreira", "Costa", "Alves", "Ribeiro"];
        const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobs[Math.floor(Math.random() * sobs.length)]}`;
        const func: Funcionario = { id, tipo, nome, nivel: 1, salario };
        const semanaAbs = semanaAbsoluta(s.tempo);
        set({
          save: {
            ...s,
            counters,
            funcionarios: [...s.funcionarios, func],
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - custoInicial },
            finance: [
              ...s.finance,
              { semanaAbs, delta: -custoInicial, motivo: `Contratação: ${tipo}` },
            ],
            lastSavedAt: Date.now(),
          },
        });
        return { ok: true, msg: `${nome} entrou para a equipe.` };
      },

      demitirFuncionario: (id) => {
        const s = get().save;
        if (!s) return;
        set({
          save: {
            ...s,
            funcionarios: s.funcionarios.filter((f) => f.id !== id),
            lastSavedAt: Date.now(),
          },
        });
      },

      avancarSemana: () => {
        const s = get().save;
        if (!s) return { eventos: [], resumo: null };
        const eventos: string[] = [];
        let counters = s.counters;
        let jogadores = s.jogadores;
        let noticias = s.noticias;
        let clubes = s.clubes;
        let empresario = { ...s.empresario };
        let finance = [...s.finance];

        const { tempo, virouAno } = proximaSemana(s.tempo);
        const semanaAbs = semanaAbsoluta(tempo);

        // Custos semanais
        const custoAdm = 100;
        const custoFuncionarios = s.funcionarios.reduce((t, f) => t + f.salario, 0);
        const totalCustos = custoAdm + custoFuncionarios;
        empresario.dinheiro -= totalCustos;
        finance.push({ semanaAbs, delta: -custoAdm, motivo: "Custos administrativos" });
        if (custoFuncionarios > 0) {
          finance.push({ semanaAbs, delta: -custoFuncionarios, motivo: "Salários funcionários" });
        }
        if (empresario.prestigio >= 10) {
          const patrocinio = 500 + empresario.prestigio * 50;
          empresario.dinheiro += patrocinio;
          finance.push({ semanaAbs, delta: patrocinio, motivo: "Patrocínio semanal" });
        }

        // Central de olheiros passiva (descobertas)
        const olhLvl = s.agencia.instalacoes.olheiros ?? 0;
        if (olhLvl > 0 && chance(0.7)) {
          const local = LOCAIS.find((l) => l.key === "campo_municipal")!;
          for (let i = 0; i < olhLvl; i++) {
            const r = gerarJogador(counters, local, { estadoPreferido: s.empresario.estado });
            counters = r.counters;
            const { noticia, counters: c3 } = criarNoticia(
              counters,
              semanaAbs,
              "Olheiro relata talento",
              `${r.jogador.nome} ${r.jogador.sobrenome} (${r.jogador.idade}, ${r.jogador.posicao}) foi mapeado pelos seus olheiros em ${r.jogador.cidade}.`,
              "info",
            );
            counters = c3;
            noticias = [noticia, ...noticias];
          }
        }

        // Envelhecimento anual + evolução + resumo
        let resumo: YearEndResumo | null = null;
        if (virouAno) {
          const jogadoresAntes = jogadores.map((j) => ({ ...j, atributos: { ...j.atributos } }));
          const clubesAntes = clubes.map((c) => ({ ...c }));

          jogadores = jogadores.map((j) => {
            const evoluido = evoluirAno(j);
            return tentarAposentar(evoluido);
          });
          // Career year (para clientes)
          jogadores = anexarCareerYear(jogadores, tempo.ano - 1, clubes, s.empresario.id);
          clubes = embaralharClubes(clubes);

          // Balanço do ano
          const inicioAno = semanaAbs - 48;
          const doAno = finance.filter((f) => f.semanaAbs >= inicioAno);
          const entradas = doAno.filter((f) => f.delta > 0).reduce((sum, f) => sum + f.delta, 0);
          const saidas = doAno.filter((f) => f.delta < 0).reduce((sum, f) => sum + Math.abs(f.delta), 0);

          resumo = calcularResumoAno({
            ano: tempo.ano - 1,
            jogadoresAntes,
            jogadoresDepois: jogadores,
            clubesAntes,
            clubesDepois: clubes,
            balanco: { entradas, saidas },
          });
          eventos.push(`Virada de ano! Temporada ${tempo.ano - 1} encerrada.`);
        }

        // Expirar propostas
        let propostas = s.propostas.filter((p) => p.expiraSemanaAbs >= semanaAbs);

        // Gerar propostas
        const { propostas: novasPropostas, counters: c2 } = gerarPropostasSemana(
          counters,
          jogadores.filter((j) => j.empresarioId === s.empresario.id && !j.aposentado),
          clubes,
          empresario,
          semanaAbs,
        );
        counters = c2;
        if (novasPropostas.length > 0) {
          propostas = [...propostas, ...novasPropostas];
          for (const p of novasPropostas) {
            const j = jogadores.find((x) => x.id === p.jogadorId);
            const c = clubes.find((x) => x.id === p.clubeId);
            if (!j || !c) continue;
            const { noticia, counters: c3 } = criarNoticia(
              counters,
              semanaAbs,
              "Proposta recebida",
              `${c.nome} quer contratar ${j.nome} ${j.sobrenome} por R$ ${p.valor.toLocaleString("pt-BR")}.`,
              "alerta",
            );
            counters = c3;
            noticias = [noticia, ...noticias];
            eventos.push(`Nova proposta: ${c.nome} → ${j.nome}`);
          }
        }

        if (chance(0.35)) {
          const flavors = [
            "Um jovem talento chama atenção no interior do país.",
            "Clubes europeus começam a monitorar o mercado brasileiro.",
            "Federação anuncia novo torneio de categorias de base.",
            "Empresário rival cresce em número de clientes.",
          ];
          const { noticia, counters: c3 } = criarNoticia(
            counters,
            semanaAbs,
            "Notícia do futebol",
            flavors[randi(0, flavors.length - 1)],
            "info",
          );
          counters = c3;
          noticias = [noticia, ...noticias];
        }

        empresario.nivel = calcularNivelPrestigio(empresario.prestigio);

        set({
          save: {
            ...s,
            tempo,
            counters,
            jogadores,
            clubes,
            propostas,
            noticias,
            empresario,
            finance,
            assistidosNaSemana: 0,
            resumoPendente: resumo ?? s.resumoPendente,
            lastSavedAt: Date.now(),
          },
        });
        return { eventos, resumo };
      },

      limparResumo: () => {
        const s = get().save;
        if (!s) return;
        set({ save: { ...s, resumoPendente: null, lastSavedAt: Date.now() } });
      },
    }),
    {
      name: "pfa:save",
      version: 2,
      migrate: (persisted: unknown, _version: number): { save: SaveState | null } => {
        const p = persisted as { save?: SaveState | null } | undefined;
        if (!p?.save) return { save: null };
        const s = p.save as unknown as Partial<SaveState> & { agencia: Partial<Agencia> & { instalacoes?: unknown } };
        const inst = (s.agencia?.instalacoes as SaveState["agencia"]["instalacoes"] | undefined) ?? instalacoesIniciais();
        const migrated: SaveState = {
          version: 2,
          empresario: s.empresario!,
          agencia: {
            ...(s.agencia as Agencia),
            instalacoes: inst,
            nivel: nivelAgencia(inst),
          },
          jogadores: (s.jogadores ?? []).map((j) => ({ ...j, historicoCarreira: j.historicoCarreira ?? [] })),
          clubes: s.clubes ?? CLUBES_SEED,
          propostas: s.propostas ?? [],
          noticias: s.noticias ?? [],
          funcionarios: s.funcionarios ?? [],
          tempo: s.tempo ?? { ano: 2026, mes: 3, semana: 1 },
          counters: s.counters ?? {},
          finance: s.finance ?? [],
          seed: s.seed ?? Date.now() & 0xffffffff,
          lastSavedAt: Date.now(),
          assistidosNaSemana: 0,
          ultimaPartida: null,
          resumoPendente: null,
        };
        return { save: migrated };
      },
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({ save: state.save }),
    },
  ),
);
