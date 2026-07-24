import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/game/Screen";
import { useGame, LOCAIS } from "@/game/store";
import { CATEGORIAS_LOCAL, type LocalCategoria } from "@/game/engine/scouting";
import { limitePartidasSemana } from "@/game/engine/facilities";

export const Route = createFileRoute("/_game/jogo/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar talentos — Project Football Agent" },
      { name: "description", content: "Visite campos, quadras e treinos para descobrir talentos." },
      { property: "og:title", content: "Explorar talentos" },
      { property: "og:description", content: "Assista partidas e treinos para encontrar novos jogadores." },
    ],
  }),
  component: Explorar,
});

function Explorar() {
  const save = useGame((s) => s.save)!;
  const assistir = useGame((s) => s.assistirLocal);
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const limite = limitePartidasSemana(save.agencia.instalacoes);
  const restantes = Math.max(0, limite - save.assistidosNaSemana);
  const nivel = save.agencia.nivel;

  const rodar = (key: (typeof LOCAIS)[number]["key"]) => {
    setErro(null);
    const r = assistir(key);
    if (!r.ok) return setErro(r.msg ?? "Erro");
    if (r.partidaId) navigate({ to: "/jogo/partida/$id", params: { id: r.partidaId } });
  };

  return (
    <Screen title="Explorar Talentos" subtitle="Scouting" back="/jogo">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Partidas/treinos restantes</div>
          <div className="text-sm font-medium text-emerald-500">{restantes} / {limite}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Agência</div>
          <div className="text-sm font-medium text-zinc-100">Nível {nivel}</div>
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-zinc-500">
        Cada visita simula uma partida ou treino. Apenas atletas que se destacaram
        demonstram interesse em conversar. Locais melhores abrem com o nível da agência.
      </p>

      <div className="space-y-5">
        {CATEGORIAS_LOCAL.map((cat: LocalCategoria) => {
          const locais = LOCAIS.filter((l) => l.categoria === cat).sort(
            (a, b) => a.nivelAgenciaRequerido - b.nivelAgenciaRequerido,
          );
          return (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <div className="text-[10px] uppercase tracking-widest text-emerald-500">{cat}</div>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="space-y-2">
                {locais.map((l) => {
                  const bloqueado = l.nivelAgenciaRequerido > nivel;
                  const semSaldo = save.empresario.dinheiro < l.custo;
                  const semTurno = restantes <= 0;
                  const disabled = bloqueado || semSaldo || semTurno;
                  return (
                    <button
                      key={l.key}
                      onClick={() => rodar(l.key)}
                      disabled={disabled}
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-4 text-left ring-1 ring-white/5 transition-transform active:scale-[0.99] disabled:opacity-40"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-zinc-100">{l.nome}</div>
                          <span className="rounded-sm bg-zinc-800 px-1 text-[10px] text-zinc-400">
                            {l.tipo === "partida" ? "Partida" : "Treino"}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">
                          {l.descricao} · {l.idadeMin}–{l.idadeMax} anos
                        </div>
                        {bloqueado ? (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-red-400">
                            🔒 Requer agência nível {l.nivelAgenciaRequerido}
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-emerald-500">
                          R$ {l.custo.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Custo</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {erro ? (
        <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400 ring-1 ring-red-500/30">
          {erro}
        </div>
      ) : null}
    </Screen>
  );
}
