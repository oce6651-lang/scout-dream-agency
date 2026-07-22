import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/game/Screen";
import { LOCAIS } from "@/game/engine/scouting";
import { useGame } from "@/game/store";
import { PlayerCard } from "@/components/game/PlayerCard";

export const Route = createFileRoute("/_game/jogo/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar talentos — Project Football Agent" },
      { name: "description", content: "Descubra jovens promessas em diferentes locais." },
      { property: "og:title", content: "Explorar talentos" },
      { property: "og:description", content: "Encontre novos jogadores para sua agência." },
    ],
  }),
  component: Explorar,
});

function Explorar() {
  const save = useGame((s) => s.save)!;
  const ultimo = useGame((s) => s.ultimoScouting);
  const explorar = useGame((s) => s.explorar);
  const [erro, setErro] = useState<string | null>(null);

  const rodar = (nome: (typeof LOCAIS)[number]["nome"]) => {
    setErro(null);
    const r = explorar(nome);
    if (!r.ok) setErro(r.msg ?? "Erro");
  };

  return (
    <Screen title="Explorar Talentos" subtitle="Scouting" back="/jogo">
      <p className="mb-4 text-xs leading-relaxed text-zinc-500">
        Escolha um local para procurar novos jogadores. Cada busca tem um custo e revela um grupo
        aleatório de atletas. Você precisa observá-los antes de contratar.
      </p>

      <div className="space-y-2">
        {LOCAIS.map((l) => {
          const canPay = save.empresario.dinheiro >= l.custo;
          return (
            <button
              key={l.nome}
              onClick={() => rodar(l.nome)}
              disabled={!canPay}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-4 text-left ring-1 ring-white/5 transition-transform active:scale-[0.99] disabled:opacity-40"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100">{l.nome}</div>
                <div className="mt-0.5 text-[11px] text-zinc-500">
                  {l.descricao} · {l.idadeMin}–{l.idadeMax} anos
                </div>
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

      {erro ? (
        <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400 ring-1 ring-red-500/30">
          {erro}
        </div>
      ) : null}

      {ultimo ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-300">
              Resultado: {ultimo.local}
            </h2>
            <span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-500">
              {ultimo.jogadores.length} atletas
            </span>
          </div>
          <div className="space-y-2">
            {ultimo.jogadores.map((j) => (
              <PlayerCard key={j.id} j={j} hrefBase="jogador" />
            ))}
          </div>
        </div>
      ) : null}
    </Screen>
  );
}
