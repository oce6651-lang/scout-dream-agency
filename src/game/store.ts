import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Agencia,
  Empresario,
  FinanceEntry,
  Funcionario,
  Jogador,
  Noticia,
  Proposta,
  SaveState,
  Tempo,
} from "./types";
import { makeId } from "./ids";
import { CLUBES_SEED } from "./data/clubes";
import { proximaSemana, semanaAbsoluta } from "./engine/time";
import { explorarLocal, LOCAIS, type LocalScouting } from "./engine/scouting";
import { aplicarObservacao, NIVEIS_OBSERVACAO } from "./engine/observation";
import { chanceAssinatura } from "./engine/signing";
import { evoluirAno } from "./engine/evolution";
import { gerarPropostasSemana } from "./engine/market";
import { criarNoticia } from "./engine/news";
import { chance, randi } from "./rng";

type Rascunho = {
  save: SaveState | null;
  // ephemeral: last scouting results (not persisted deeply, but stored so page nav works)
  ultimoScouting: { local: LocalScouting; jogadores: Jogador[] } | null;
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

  explorar: (local: LocalScouting) => { ok: boolean; msg?: string };
  observar: (jogadorId: string, nivel: 1 | 2 | 3) => { ok: boolean; msg?: string };
  assinar: (jogadorId: string) => { ok: boolean; msg: string };

  responderProposta: (
    propostaId: string,
    acao: "aceitar" | "recusar" | "negociar",
  ) => { ok: boolean; msg: string };

  contratarFuncionario: (tipo: Funcionario["tipo"]) => { ok: boolean; msg: string };
  demitirFuncionario: (id: string) => void;

  avancarSemana: () => { eventos: string[] };
};

type Store = Rascunho & Actions;

function jogadorEscoutado(map: Map<string, Jogador>, id: string): Jogador | undefined {
  return map.get(id);
}

function calcularNivelPrestigio(prestigio: number): number {
  return Math.max(1, Math.floor(prestigio / 10) + 1);
}

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      save: null,
      ultimoScouting: null,

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
        const agencia: Agencia = {
          id: agnId,
          nome: input.nomeAgencia,
          cidade: input.cidade,
          anoFundacao: 2026,
          nivel: 1,
          reputacao: 1,
        };
        const save: SaveState = {
          version: 1,
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
        };
        set({ save, ultimoScouting: null });
      },

      reset: () => set({ save: null, ultimoScouting: null }),

      explorar: (localNome) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const local = LOCAIS.find((l) => l.nome === localNome);
        if (!local) return { ok: false, msg: "Local inválido" };
        if (s.empresario.dinheiro < local.custo)
          return { ok: false, msg: "Dinheiro insuficiente" };

        const { jogadores, counters } = explorarLocal(s.counters, local, {
          estadoPreferido: s.empresario.estado,
        });
        const semanaAbs = semanaAbsoluta(s.tempo);
        const finance: FinanceEntry[] = [
          ...s.finance,
          { semanaAbs, delta: -local.custo, motivo: `Scouting em ${local.nome}` },
        ];

        set({
          save: {
            ...s,
            counters,
            finance,
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - local.custo },
            lastSavedAt: Date.now(),
          },
          ultimoScouting: { local: localNome, jogadores },
        });
        return { ok: true };
      },

      observar: (jogadorId, nivel) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const info = NIVEIS_OBSERVACAO.find((n) => n.nivel === nivel)!;
        if (s.empresario.dinheiro < info.custo)
          return { ok: false, msg: "Dinheiro insuficiente" };

        // Pode ser jogador do scouting atual OU cliente da agência
        const scoutList = get().ultimoScouting?.jogadores ?? [];
        const idxScout = scoutList.findIndex((j) => j.id === jogadorId);
        const idxOwn = s.jogadores.findIndex((j) => j.id === jogadorId);
        if (idxScout < 0 && idxOwn < 0)
          return { ok: false, msg: "Jogador não encontrado" };

        const semanaAbs = semanaAbsoluta(s.tempo);
        let newScouting = get().ultimoScouting;
        let newJogadoresAgencia = s.jogadores;
        if (idxScout >= 0 && newScouting) {
          const arr = [...newScouting.jogadores];
          arr[idxScout] = aplicarObservacao(arr[idxScout], nivel);
          newScouting = { ...newScouting, jogadores: arr };
        }
        if (idxOwn >= 0) {
          const arr = [...s.jogadores];
          arr[idxOwn] = aplicarObservacao(arr[idxOwn], nivel);
          newJogadoresAgencia = arr;
        }

        set({
          save: {
            ...s,
            jogadores: newJogadoresAgencia,
            empresario: { ...s.empresario, dinheiro: s.empresario.dinheiro - info.custo },
            finance: [
              ...s.finance,
              { semanaAbs, delta: -info.custo, motivo: `Observação ${info.nome}` },
            ],
            lastSavedAt: Date.now(),
          },
          ultimoScouting: newScouting,
        });
        return { ok: true };
      },

      assinar: (jogadorId) => {
        const s = get().save;
        if (!s) return { ok: false, msg: "Sem jogo" };
        const scouting = get().ultimoScouting;
        const jogador = scouting?.jogadores.find((j) => j.id === jogadorId);
        if (!jogador) return { ok: false, msg: "Jogador não está no relatório" };
        if (s.jogadores.some((j) => j.id === jogadorId))
          return { ok: false, msg: "Já é seu cliente" };

        const p = chanceAssinatura(s.empresario, jogador);
        const semanaAbs = semanaAbsoluta(s.tempo);
        if (chance(p)) {
          const novoCliente: Jogador = {
            ...jogador,
            empresarioId: s.empresario.id,
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

          // remover da lista de scouting para não reassinar
          const scoutingRestante = scouting!.jogadores.filter((j) => j.id !== jogadorId);
          set({
            save: {
              ...s,
              jogadores: [...s.jogadores, novoCliente],
              noticias: [noticia, ...s.noticias],
              counters,
              empresario,
              lastSavedAt: Date.now(),
            },
            ultimoScouting: { ...scouting!, jogadores: scoutingRestante },
          });
          return { ok: true, msg: `Contrato assinado com ${jogador.nome}!` };
        } else {
          return { ok: false, msg: `${jogador.nome} recusou a proposta.` };
        }
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
          // simples: 50% aumenta valor 10-30%, 50% clube desiste
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
        // aceitar
        const comissao = Math.round((proposta.valor * proposta.comissaoPct) / 100);
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
        if (s.empresario.dinheiro < custoInicial)
          return { ok: false, msg: "Dinheiro insuficiente" };
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
        if (!s) return { eventos: [] };
        const eventos: string[] = [];
        let counters = s.counters;
        let jogadores = s.jogadores;
        let noticias = s.noticias;
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

        // Patrocínio se prestígio alto
        if (empresario.prestigio >= 10) {
          const patrocinio = 500 + empresario.prestigio * 50;
          empresario.dinheiro += patrocinio;
          finance.push({ semanaAbs, delta: patrocinio, motivo: "Patrocínio semanal" });
        }

        // Envelhecimento anual + evolução
        if (virouAno) {
          jogadores = jogadores.map((j) => {
            const antes = j.idade;
            const novo = evoluirAno(j);
            if (novo.idade !== antes) {
              // pequeno registro
              novo.historico = [
                ...novo.historico,
                {
                  ano: tempo.ano,
                  mes: 1,
                  semana: 1,
                  texto: `Completou ${novo.idade} anos`,
                },
              ];
            }
            return novo;
          });
          eventos.push(`Virada de ano! Seus jogadores evoluíram.`);
        }

        // Expirar propostas antigas
        let propostas = s.propostas.filter((p) => p.expiraSemanaAbs >= semanaAbs);

        // Gerar novas propostas
        const { propostas: novasPropostas, counters: c2 } = gerarPropostasSemana(
          counters,
          jogadores.filter((j) => j.empresarioId === s.empresario.id),
          s.clubes,
          empresario,
          semanaAbs,
        );
        counters = c2;
        if (novasPropostas.length > 0) {
          propostas = [...propostas, ...novasPropostas];
          for (const p of novasPropostas) {
            const j = jogadores.find((x) => x.id === p.jogadorId);
            const c = s.clubes.find((x) => x.id === p.clubeId);
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

        // Notícia flavor aleatória
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
            propostas,
            noticias,
            empresario,
            finance,
            lastSavedAt: Date.now(),
          },
        });
        return { eventos };
      },
    }),
    {
      name: "pfa:save",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ save: state.save }),
    },
  ),
);
