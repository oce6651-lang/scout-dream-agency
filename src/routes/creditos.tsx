import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";

export const Route = createFileRoute("/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos — Project Football Agent" },
      { name: "description", content: "Créditos e informações sobre o Project Football Agent." },
      { property: "og:title", content: "Créditos" },
      { property: "og:description", content: "Sobre o Project Football Agent." },
    ],
  }),
  component: Creditos,
});

function Creditos() {
  return (
    <Screen title="Créditos" subtitle="Sobre o jogo" back="/">
      <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
        <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
          <div className="text-xs font-medium uppercase tracking-widest text-emerald-500">
            Project Football Agent
          </div>
          <p className="mt-2">
            Um simulador de carreira de empresário de futebol, inspirado em Football Agent e
            Football Academy Manager. MVP jogável, salvo localmente.
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Tecnologia</div>
          <ul className="space-y-1 text-xs text-zinc-300">
            <li>· React 19 + TypeScript</li>
            <li>· TanStack Router / Query</li>
            <li>· Tailwind CSS v4</li>
            <li>· Zustand (persist local)</li>
          </ul>
        </div>
        <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Aviso</div>
          <p className="text-xs">
            Nomes de clubes reais são usados apenas como referência lúdica; este é um projeto de
            fã, sem afiliação oficial.
          </p>
        </div>
      </div>
    </Screen>
  );
}
