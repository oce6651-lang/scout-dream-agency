import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/_game/jogo/mercado")({
  head: () => ({
    meta: [
      { title: "Mercado — Project Football Agent" },
      { name: "description", content: "Propostas recebidas dos clubes." },
      { property: "og:title", content: "Mercado de transferências" },
      { property: "og:description", content: "Negocie propostas para seus atletas." },
    ],
  }),
  component: Mercado,
});

function Mercado() {
  const save = useGame((s) => s.save)!;
  const responder = useGame((s) => s.responderProposta);
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  const propostas = save.propostas;

  return (
    <Screen title="Mercado" subtitle={`${propostas.length} propostas`} back="/jogo">
      {msg ? (
        <div
          className={`mb-3 rounded-lg px-3 py-2 text-center text-xs ring-1 ${msg.ok ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" : "bg-red-500/10 text-red-400 ring-red-500/30"}`}
        >
          {msg.msg}
        </div>
      ) : null}

      {propostas.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-6 text-center ring-1 ring-white/5">
          <div className="text-sm text-zinc-200">Nenhuma proposta ativa.</div>
          <div className="mt-1 text-xs text-zinc-500">
            Avance semanas para que clubes venham até você.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {propostas.map((p) => {
            const j = save.jogadores.find((x) => x.id === p.jogadorId);
            const c = save.clubes.find((x) => x.id === p.clubeId);
            if (!j || !c) return null;
            const comissao = Math.round((p.valor * p.comissaoPct) / 100);
            return (
              <div key={p.id} className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-500">
                      {c.nome} · {c.pais}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-zinc-100">
                      Quer contratar {j.nome} {j.sobrenome}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {j.idade} anos · {j.posicao}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Valor</div>
                    <div className="text-sm font-medium text-zinc-100">
                      R$ {p.valor.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-zinc-800/60 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500">Salário</div>
                    <div className="text-[11px] text-zinc-200">
                      R$ {p.salario.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="rounded-md bg-zinc-800/60 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Comissão
                    </div>
                    <div className="text-[11px] text-emerald-500">
                      {p.comissaoPct}% ≈ R$ {comissao.toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="rounded-md bg-zinc-800/60 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500">Expira</div>
                    <div className="text-[11px] text-zinc-200">
                      {p.expiraSemanaAbs - p.criadaSemanaAbs} sem.
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMsg(responder(p.id, "aceitar"))}
                    className="rounded-lg bg-emerald-600 py-2 text-xs font-medium text-zinc-950"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => setMsg(responder(p.id, "negociar"))}
                    className="rounded-lg bg-zinc-800 py-2 text-xs font-medium text-zinc-100 ring-1 ring-white/10"
                  >
                    Negociar
                  </button>
                  <button
                    onClick={() => setMsg(responder(p.id, "recusar"))}
                    className="rounded-lg bg-zinc-900 py-2 text-xs font-medium text-red-400 ring-1 ring-red-500/30"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
