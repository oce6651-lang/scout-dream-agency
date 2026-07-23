import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { overallJogador } from "@/game/engine/scouting";

export const Route = createFileRoute("/_game/jogo/partida/$id")({
  head: () => ({
    meta: [
      { title: "Partida — Project Football Agent" },
      { name: "description", content: "Resultado da partida e atletas em destaque." },
      { property: "og:title", content: "Resumo da partida" },
      { property: "og:description", content: "Atletas em destaque e interessados." },
    ],
  }),
  component: Partida,
});

function Partida() {
  const { id } = Route.useParams();
  const save = useGame((s) => s.save)!;
  const p = save.ultimaPartida;

  if (!p || p.id !== id) {
    return (
      <Screen title="Partida" back="/jogo/explorar">
        <p className="text-sm text-zinc-500">Este resultado não está mais disponível.</p>
      </Screen>
    );
  }

  const isTreino = p.tipo === "treino";
  const interessados = p.jogadores.filter((j) => j.interessado);
  const outros = p.jogadores.filter((j) => !j.interessado);

  return (
    <Screen title={p.local} subtitle={isTreino ? "Treino observado" : "Partida assistida"} back="/jogo/explorar">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        {isTreino ? (
          <div className="text-center text-sm text-zinc-300">
            Sessão de treino — sem placar.
          </div>
        ) : (
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">{p.timeA}</div>
              <div className="text-3xl font-semibold text-zinc-100">{p.placar[0]}</div>
            </div>
            <div className="text-zinc-600">×</div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">{p.timeB}</div>
              <div className="text-3xl font-semibold text-zinc-100">{p.placar[1]}</div>
            </div>
          </div>
        )}
      </div>

      {p.destaques.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Destaques</h2>
          <div className="space-y-1.5">
            {p.destaques.map((d, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-zinc-900 px-3 py-2 ring-1 ring-white/5">
                {!isTreino && (
                  <span className="mt-0.5 text-[10px] font-medium text-emerald-500">{d.minuto}'</span>
                )}
                <span className="text-xs text-zinc-200">{d.texto}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-emerald-500">
        Interessados em conversar ({interessados.length})
      </h2>
      <div className="mb-6 space-y-2">
        {interessados.length === 0 ? (
          <div className="rounded-lg bg-zinc-900 p-3 text-center text-xs text-zinc-500 ring-1 ring-white/5">
            Ninguém demonstrou interesse desta vez.
          </div>
        ) : (
          interessados.map((j) => <AtletaRow key={j.id} j={j} podeAssinar />)
        )}
      </div>

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
        Demais atletas ({outros.length})
      </h2>
      <div className="space-y-2">
        {outros.map((j) => <AtletaRow key={j.id} j={j} />)}
      </div>
    </Screen>
  );
}

function AtletaRow({ j, podeAssinar }: { j: import("@/game/types").Jogador; podeAssinar?: boolean }) {
  const ovr = overallJogador(j);
  const nota = j.notaPartida ?? 6.5;
  const notaColor = nota >= 7.5 ? "text-emerald-500" : nota >= 6.5 ? "text-zinc-200" : "text-zinc-500";
  const row = (
    <div className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">
        {j.nome[0]}{j.sobrenome[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-zinc-100">{j.nome} {j.sobrenome}</div>
          <span className="rounded-sm bg-emerald-500/10 px-1 text-[10px] font-medium text-emerald-500">{j.posicao}</span>
          {j.interessado && <span className="rounded-sm bg-emerald-500/20 px-1 text-[10px] text-emerald-400">Interessado</span>}
        </div>
        <div className="truncate text-[11px] text-zinc-500">
          {j.idade} anos · OVR {ovr} · {j.cidade}-{j.estado}
        </div>
      </div>
      <div className={`shrink-0 text-right text-sm font-semibold ${notaColor}`}>{nota.toFixed(1)}</div>
    </div>
  );
  if (!podeAssinar) return row;
  return (
    <Link to="/jogo/jogador/$id" params={{ id: j.id }} className="block transition-transform active:scale-[0.99]">
      {row}
    </Link>
  );
}
