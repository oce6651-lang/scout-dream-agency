import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/_game/jogo/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Project Football Agent" },
      { name: "description", content: "Feed de notícias do mundo do futebol e da sua agência." },
      { property: "og:title", content: "Notícias" },
      { property: "og:description", content: "Feed automático de notícias do jogo." },
    ],
  }),
  component: Noticias,
});

function Noticias() {
  const save = useGame((s) => s.save)!;
  return (
    <Screen title="Notícias" subtitle={`${save.noticias.length} publicações`} back="/jogo">
      <div className="space-y-2">
        {save.noticias.map((n) => (
          <div key={n.id} className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
            <div
              className={`text-[10px] uppercase tracking-widest ${n.tipo === "sucesso" ? "text-emerald-500" : n.tipo === "alerta" ? "text-amber-400" : "text-zinc-500"}`}
            >
              {n.tipo}
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-100">{n.titulo}</div>
            <div className="mt-1 text-xs text-zinc-400">{n.corpo}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
