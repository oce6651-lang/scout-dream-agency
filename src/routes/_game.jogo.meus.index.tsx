import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { PlayerCard } from "@/components/game/PlayerCard";

export const Route = createFileRoute("/_game/jogo/meus/")({
  head: () => ({
    meta: [
      { title: "Meus jogadores — Project Football Agent" },
      { name: "description", content: "Portfólio de atletas da sua agência." },
      { property: "og:title", content: "Meus jogadores" },
      { property: "og:description", content: "Portfólio de atletas da agência." },
    ],
  }),
  component: Meus,
});

function Meus() {
  const save = useGame((s) => s.save)!;
  const clientes = save.jogadores.filter((j) => j.empresarioId === save.empresario.id);

  return (
    <Screen title="Meus Jogadores" subtitle={`${clientes.length} atletas`} back="/jogo">
      {clientes.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-6 text-center ring-1 ring-white/5">
          <div className="text-sm text-zinc-200">Nenhum cliente ainda.</div>
          <div className="mt-1 text-xs text-zinc-500">Vá em Explorar Talentos para começar.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map((j) => (
            <PlayerCard key={j.id} j={j} hrefBase="meus" />
          ))}
        </div>
      )}
    </Screen>
  );
}
