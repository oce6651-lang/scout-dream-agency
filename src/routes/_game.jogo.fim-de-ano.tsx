import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { PrimaryCTA } from "@/components/game/PrimaryCTA";

export const Route = createFileRoute("/_game/jogo/fim-de-ano")({
  head: () => ({
    meta: [
      { title: "Fim de ano — Project Football Agent" },
      { name: "description", content: "Resumo de temporada da sua agência." },
      { property: "og:title", content: "Resumo de fim de ano" },
      { property: "og:description", content: "Envelhecimento, evolução e mudanças de categoria." },
    ],
  }),
  component: FimDeAno,
});

function FimDeAno() {
  const save = useGame((s) => s.save)!;
  const limpar = useGame((s) => s.limparResumo);
  const navigate = useNavigate();
  const r = save.resumoPendente;

  if (!r) {
    return (
      <Screen title="Fim de ano" back="/jogo">
        <p className="text-sm text-zinc-500">Nenhum resumo pendente.</p>
      </Screen>
    );
  }

  const continuar = () => {
    limpar();
    navigate({ to: "/jogo" });
  };

  return (
    <Screen
      title={`Temporada ${r.ano}`}
      subtitle="Balanço da agência"
      bottom={<PrimaryCTA onClick={continuar}>Continuar temporada</PrimaryCTA>}
    >
      {/* Balanço financeiro */}
      <div className="mb-6 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <h2 className="mb-3 text-[10px] uppercase tracking-widest text-zinc-500">Balanço financeiro</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Entradas</div>
            <div className="text-sm font-medium text-emerald-500">
              R$ {r.balanco.entradas.toLocaleString("pt-BR")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Saídas</div>
            <div className="text-sm font-medium text-red-400">
              R$ {r.balanco.saidas.toLocaleString("pt-BR")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Lucro</div>
            <div className={`text-sm font-medium ${r.balanco.lucro < 0 ? "text-red-500" : "text-zinc-100"}`}>
              {r.balanco.lucro < 0 ? "-" : ""}R$ {Math.abs(r.balanco.lucro).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      </div>

      {/* Envelhecimento e evolução */}
      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
        Seus atletas ({r.jogadores.length})
      </h2>
      {r.jogadores.length === 0 ? (
        <div className="mb-6 rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
          Sem clientes esta temporada.
        </div>
      ) : (
        <div className="mb-6 space-y-2">
          {r.jogadores.map((d) => {
            const deltaOvr = d.depois.overall - d.antes.overall;
            const deltaColor = deltaOvr > 0 ? "text-emerald-500" : deltaOvr < 0 ? "text-red-400" : "text-zinc-500";
            return (
              <div key={d.jogadorId} className="rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-zinc-100">{d.nome}</div>
                  {d.aposentou && (
                    <span className="rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                      Aposentou
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {d.antes.idade} → {d.depois.idade} anos · OVR {d.antes.overall} → {d.depois.overall}{" "}
                  <span className={deltaColor}>({deltaOvr >= 0 ? "+" : ""}{deltaOvr})</span>
                </div>
                {d.mudouCategoria && (
                  <div className="mt-1 text-[10px] text-emerald-500">
                    Categoria: {d.antes.categoria} → {d.depois.categoria}
                  </div>
                )}
                {Object.keys(d.deltasAtributos).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(d.deltasAtributos).map(([k, v]) => (
                      <span
                        key={k}
                        className={`rounded-sm px-1 text-[10px] ${(v ?? 0) > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {k} {(v ?? 0) > 0 ? "+" : ""}{v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Clubes */}
      {r.clubes.length > 0 && (
        <>
          <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
            Cenário dos clubes
          </h2>
          <div className="space-y-2">
            {r.clubes.map((c) => {
              const up = c.depoisNivel > c.antesNivel;
              return (
                <div key={c.clubeId} className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
                  <div className="text-sm text-zinc-100">{c.nome}</div>
                  <div className={`text-xs font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>
                    Nv {c.antesNivel} → {c.depoisNivel}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Screen>
  );
}
