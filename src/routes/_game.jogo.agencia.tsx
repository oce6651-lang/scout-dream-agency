import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/game/Screen";
import { useGame, FACILITIES, custoUpgrade, FACILITY_MAX } from "@/game/store";

export const Route = createFileRoute("/_game/jogo/agencia")({
  head: () => ({
    meta: [
      { title: "Minha agência — Project Football Agent" },
      { name: "description", content: "Instalações e funcionários da sua agência." },
      { property: "og:title", content: "Minha agência" },
      { property: "og:description", content: "Melhore instalações e monte sua equipe." },
    ],
  }),
  component: Agencia,
});

const TIPOS = [
  { tipo: "olheiro" as const, nome: "Olheiro", desc: "Melhora precisão da observação.", custo: 1500, salario: 400 },
  { tipo: "advogado" as const, nome: "Advogado", desc: "Melhora contraprostas em negociações.", custo: 1200, salario: 350 },
  { tipo: "assistente" as const, nome: "Assistente", desc: "Reduz custos administrativos futuros.", custo: 800, salario: 200 },
];

function Agencia() {
  const save = useGame((s) => s.save)!;
  const contratar = useGame((s) => s.contratarFuncionario);
  const demitir = useGame((s) => s.demitirFuncionario);
  const upgrade = useGame((s) => s.melhorarInstalacao);
  const [tab, setTab] = useState<"instalacoes" | "equipe">("instalacoes");
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  return (
    <Screen title="Minha Agência" subtitle={save.agencia.nome} back="/jogo">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Fundação</div>
            <div className="text-sm font-medium text-zinc-100">{save.agencia.anoFundacao}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Nível</div>
            <div className="text-sm font-medium text-emerald-500">{save.agencia.nivel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Reputação</div>
            <div className="text-sm font-medium text-zinc-100">{save.agencia.reputacao}</div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {(["instalacoes", "equipe"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-widest ring-1 ${tab === t ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" : "bg-zinc-900 text-zinc-400 ring-white/5"}`}
          >
            {t === "instalacoes" ? "Instalações" : "Equipe"}
          </button>
        ))}
      </div>

      {msg ? (
        <div className={`mb-3 rounded-lg px-3 py-2 text-center text-xs ring-1 ${msg.ok ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" : "bg-red-500/10 text-red-400 ring-red-500/30"}`}>
          {msg.msg}
        </div>
      ) : null}

      {tab === "instalacoes" ? (
        <div className="space-y-2">
          {FACILITIES.map((f) => {
            const nivel = save.agencia.instalacoes[f.key] ?? 0;
            const maxed = nivel >= FACILITY_MAX;
            const custo = maxed ? 0 : custoUpgrade(nivel);
            const podePagar = save.empresario.dinheiro >= custo;
            return (
              <div key={f.key} className="rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">{f.nome}</div>
                    <div className="text-[11px] text-zinc-500">{f.descricao}</div>
                    <div className="mt-1 text-[10px] text-emerald-500">
                      Nível atual: {nivel}/{FACILITY_MAX} · {f.efeito(nivel)}
                    </div>
                  </div>
                  <button
                    onClick={() => setMsg(upgrade(f.key))}
                    disabled={maxed || !podePagar}
                    className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-40"
                  >
                    {maxed ? "MAX" : `R$ ${custo.toLocaleString("pt-BR")}`}
                  </button>
                </div>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: FACILITY_MAX }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < nivel ? "bg-emerald-500" : "bg-zinc-800"}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
            Contratar funcionários
          </h2>
          <div className="mb-6 space-y-2">
            {TIPOS.map((t) => (
              <div key={t.tipo} className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
                <div className="min-w-0 pr-2">
                  <div className="text-sm font-medium text-zinc-100">{t.nome}</div>
                  <div className="text-[11px] text-zinc-500">{t.desc}</div>
                  <div className="mt-0.5 text-[10px] text-zinc-600">
                    Salário R$ {t.salario.toLocaleString("pt-BR")}/semana
                  </div>
                </div>
                <button
                  onClick={() => setMsg(contratar(t.tipo))}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-zinc-950"
                >
                  R$ {t.custo.toLocaleString("pt-BR")}
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Equipe atual</h2>
          {save.funcionarios.length === 0 ? (
            <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
              Nenhum funcionário contratado.
            </div>
          ) : (
            <div className="space-y-2">
              {save.funcionarios.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{f.nome}</div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                      {f.tipo} · Nv {f.nivel} · R$ {f.salario}/sem
                    </div>
                  </div>
                  <button
                    onClick={() => demitir(f.id)}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] text-red-400 ring-1 ring-red-500/30"
                  >
                    Demitir
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
