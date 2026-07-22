import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { PrimaryCTA } from "@/components/game/PrimaryCTA";
import { MESES_PT } from "@/game/engine/time";

export const Route = createFileRoute("/_game/jogo/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Project Football Agent" },
      { name: "description", content: "Histórico financeiro, save e opções." },
      { property: "og:title", content: "Configurações" },
      { property: "og:description", content: "Gerencie save e visualize finanças." },
    ],
  }),
  component: Config,
});

function Config() {
  const save = useGame((s) => s.save)!;
  const reset = useGame((s) => s.reset);
  const navigate = useNavigate();

  const finance = save.finance.slice().reverse().slice(0, 40);

  const semanaParaData = (abs: number) => {
    const ano = 2026 + Math.floor(abs / 48);
    const mes = Math.floor((abs % 48) / 4) + 1;
    const semana = (abs % 4) + 1;
    return `${MESES_PT[mes - 1].slice(0, 3)}/${ano} · S${semana}`;
  };

  return (
    <Screen title="Configurações" subtitle="Save & finanças" back="/jogo">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Save</div>
        <div className="text-xs text-zinc-400">
          Salvamento automático ativado. Último save:{" "}
          <span className="text-zinc-200">
            {new Date(save.lastSavedAt).toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <PrimaryCTA
            variant="danger"
            onClick={() => {
              if (confirm("Apagar todo o progresso? Não pode ser desfeito.")) {
                reset();
                navigate({ to: "/" });
              }
            }}
          >
            Apagar save e voltar ao menu
          </PrimaryCTA>
        </div>
      </div>

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
        Histórico financeiro (últimos 40)
      </h2>
      {finance.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
          Nenhuma movimentação ainda.
        </div>
      ) : (
        <div className="space-y-1.5">
          {finance.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 ring-1 ring-white/5"
            >
              <div className="min-w-0 pr-2">
                <div className="truncate text-xs text-zinc-200">{f.motivo}</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {semanaParaData(f.semanaAbs)}
                </div>
              </div>
              <div
                className={`shrink-0 text-xs font-medium ${f.delta >= 0 ? "text-emerald-500" : "text-red-400"}`}
              >
                {f.delta >= 0 ? "+" : "−"} R$ {Math.abs(f.delta).toLocaleString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
