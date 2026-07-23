import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/_game/jogo/historico")({
  head: () => ({
    meta: [
      { title: "Histórico da agência — Project Football Agent" },
      { name: "description", content: "Todos os jogadores já gerenciados pela sua agência." },
      { property: "og:title", content: "Histórico da agência" },
      { property: "og:description", content: "Timeline anual de cada cliente." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const save = useGame((s) => s.save)!;
  const geridos = save.jogadores.filter((j) => j.empresarioId === save.empresario.id);

  return (
    <Screen title="Histórico da Agência" subtitle={`${geridos.length} atletas registrados`} back="/jogo">
      {geridos.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-6 text-center ring-1 ring-white/5">
          <div className="text-sm text-zinc-200">Ainda sem histórico.</div>
          <div className="mt-1 text-xs text-zinc-500">Assine seu primeiro cliente para começar.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {geridos.map((j) => {
            const ultimo = j.historicoCarreira[j.historicoCarreira.length - 1];
            const somaGols = j.historicoCarreira.reduce((s, y) => s + y.gols, 0);
            const somaAss = j.historicoCarreira.reduce((s, y) => s + y.assistencias, 0);
            const somaJogos = j.historicoCarreira.reduce((s, y) => s + y.jogos, 0);
            return (
              <Link
                key={j.id}
                to="/jogo/historico/$id"
                params={{ id: j.id }}
                className="block rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">
                    {j.nome[0]}{j.sobrenome[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium text-zinc-100">{j.nome} {j.sobrenome}</div>
                      <span className="rounded-sm bg-emerald-500/10 px-1 text-[10px] text-emerald-500">{j.posicao}</span>
                      {j.aposentado && <span className="rounded-sm bg-zinc-800 px-1 text-[10px] text-zinc-400">Aposentado</span>}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {j.idade} anos · {ultimo?.clubeNome ?? "—"} · {somaJogos} jg / {somaGols} G / {somaAss} A
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
