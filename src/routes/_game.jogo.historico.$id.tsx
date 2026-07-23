import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { AttributeBar } from "@/components/game/AttributeBar";

export const Route = createFileRoute("/_game/jogo/historico/$id")({
  head: () => ({
    meta: [
      { title: "Carreira do atleta — Project Football Agent" },
      { name: "description", content: "Timeline anual de um cliente da agência." },
      { property: "og:title", content: "Carreira do atleta" },
      { property: "og:description", content: "Jogos, gols, assistências e clubes por ano." },
    ],
  }),
  component: HistoricoDetalhe,
});

function HistoricoDetalhe() {
  const { id } = Route.useParams();
  const save = useGame((s) => s.save)!;
  const j = save.jogadores.find((x) => x.id === id);
  if (!j) {
    return (
      <Screen title="Atleta" back="/jogo/historico">
        <p className="text-sm text-zinc-500">Não encontrado.</p>
      </Screen>
    );
  }
  const totais = j.historicoCarreira.reduce(
    (acc, y) => ({
      jogos: acc.jogos + y.jogos,
      gols: acc.gols + y.gols,
      assistencias: acc.assistencias + y.assistencias,
    }),
    { jogos: 0, gols: 0, assistencias: 0 },
  );

  return (
    <Screen title={`${j.nome} ${j.sobrenome}`} subtitle="Carreira" back="/jogo/historico">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
            {j.nome[0]}{j.sobrenome[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-100">{j.nome} {j.sobrenome}</div>
            <div className="text-[11px] text-zinc-500">
              {j.idade} anos · {j.posicao} · {j.peDominante}
              {j.aposentado ? " · Aposentado" : ""}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Jogos</div>
            <div className="text-sm font-medium text-zinc-100">{totais.jogos}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Gols</div>
            <div className="text-sm font-medium text-emerald-500">{totais.gols}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Assist.</div>
            <div className="text-sm font-medium text-zinc-100">{totais.assistencias}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <AttributeBar label="Velocidade" value={j.atributos.velocidade} />
          <AttributeBar label="Passe" value={j.atributos.passe} />
          <AttributeBar label="Finalização" value={j.atributos.finalizacao} />
          <AttributeBar label="Defesa" value={j.atributos.defesa} />
          <AttributeBar label="Físico" value={j.atributos.fisico} />
          <AttributeBar label="Técnica" value={j.atributos.tecnica} />
        </div>
      </div>

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Temporadas</h2>
      {j.historicoCarreira.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
          Ainda sem temporadas registradas. Avance o tempo para gerar histórico anual.
        </div>
      ) : (
        <div className="space-y-2">
          {[...j.historicoCarreira].reverse().map((y) => (
            <div key={y.ano} className="rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-100">{y.ano}</div>
                <span className="rounded-sm bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {y.categoria}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-500">
                {y.clubeNome} · {y.idade} anos · OVR {y.overall}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-zinc-950 py-1">
                  <div className="text-[10px] text-zinc-500">Jogos</div>
                  <div className="text-sm text-zinc-100">{y.jogos}</div>
                </div>
                <div className="rounded-md bg-zinc-950 py-1">
                  <div className="text-[10px] text-zinc-500">Gols</div>
                  <div className="text-sm text-emerald-500">{y.gols}</div>
                </div>
                <div className="rounded-md bg-zinc-950 py-1">
                  <div className="text-[10px] text-zinc-500">Assist.</div>
                  <div className="text-sm text-zinc-100">{y.assistencias}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
