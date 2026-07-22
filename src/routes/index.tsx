import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Football Agent — Sua carreira de empresário" },
      { name: "description", content: "Construa sua agência de futebol do zero. Descubra jovens talentos, feche contratos e ganhe prestígio mundial." },
      { property: "og:title", content: "Project Football Agent" },
      { property: "og:description", content: "Simulação de empresário de futebol." },
    ],
  }),
  component: Menu,
});

function Menu() {
  const temSave = useGame((s) => s.save !== null);
  const nomeAgencia = useGame((s) => s.save?.agencia.nome);
  const resetJogo = useGame((s) => s.reset);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-zinc-950 text-zinc-400">
      <div className="flex min-h-screen flex-col justify-between px-6 pb-10 pt-16">
        <header>
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-500">
            Project
          </div>
          <h1 className="mt-1 text-4xl font-bold leading-none tracking-tight text-zinc-100">
            Football
            <br />
            Agent
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            Você começa sem nome, sem dinheiro e sem clientes. Construa a maior agência de futebol
            do mundo, um talento por vez.
          </p>
        </header>

        <div className="mt-16 space-y-3">
          {temSave ? (
            <Link
              to="/jogo"
              className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-4 py-4 text-sm font-medium text-zinc-950 shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-500/50"
            >
              <span>Continuar — {nomeAgencia}</span>
              <span>→</span>
            </Link>
          ) : null}
          <Link
            to="/novo"
            className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-sm font-medium ring-1 ring-white/10 ${temSave ? "bg-zinc-900 text-zinc-200" : "bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-900/30 ring-emerald-500/50"}`}
          >
            <span>Novo jogo</span>
            <span>+</span>
          </Link>
          <button
            onClick={() => {
              if (confirm("Isso apagará seu progresso atual. Continuar?")) resetJogo();
            }}
            disabled={!temSave}
            className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-4 text-sm font-medium text-zinc-300 ring-1 ring-white/10 disabled:opacity-40"
          >
            <span>Apagar save</span>
            <span>×</span>
          </button>
          <Link
            to="/creditos"
            className="flex w-full items-center justify-between rounded-xl bg-zinc-900 px-4 py-4 text-sm font-medium text-zinc-300 ring-1 ring-white/10"
          >
            <span>Créditos</span>
            <span>ⓘ</span>
          </Link>
        </div>

        <footer className="mt-16 text-center text-[10px] uppercase tracking-widest text-zinc-600">
          v0.1 · MVP · Salvamento automático local
        </footer>
      </div>
    </div>
  );
}
