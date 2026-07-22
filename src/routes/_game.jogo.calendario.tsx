import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { MESES_PT, formatarData } from "@/game/engine/time";

export const Route = createFileRoute("/_game/jogo/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Project Football Agent" },
      { name: "description", content: "Progresso do ano, mês e semana." },
      { property: "og:title", content: "Calendário" },
      { property: "og:description", content: "Acompanhe o tempo no jogo." },
    ],
  }),
  component: Cal,
});

function Cal() {
  const save = useGame((s) => s.save)!;
  const { ano, mes, semana } = save.tempo;
  return (
    <Screen title="Calendário" subtitle={formatarData(save.tempo)} back="/jogo">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Data atual</div>
        <div className="mt-1 text-2xl font-semibold text-zinc-100">
          {MESES_PT[mes - 1]} {ano}
        </div>
        <div className="mt-1 text-xs text-emerald-500">Semana {semana} de 4</div>
      </div>

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
        Ano {ano}
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {MESES_PT.map((m, i) => {
          const idx = i + 1;
          const passou = idx < mes;
          const atual = idx === mes;
          return (
            <div
              key={m}
              className={`rounded-lg p-3 ring-1 ${atual ? "bg-emerald-500/10 ring-emerald-500/40 text-emerald-400" : passou ? "bg-zinc-900 ring-white/5 text-zinc-500" : "bg-zinc-900 ring-white/5 text-zinc-300"}`}
            >
              <div className="text-[10px] uppercase tracking-widest">
                {passou ? "Passou" : atual ? "Atual" : "Futuro"}
              </div>
              <div className="text-sm font-medium">{m.slice(0, 3)}</div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
