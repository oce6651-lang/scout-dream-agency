import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { AttributeBar } from "@/components/game/AttributeBar";
import { textoPotencial } from "@/game/engine/observation";
import { MESES_PT } from "@/game/engine/time";

export const Route = createFileRoute("/_game/jogo/meus/$id")({
  head: () => ({
    meta: [
      { title: "Cliente — Project Football Agent" },
      { name: "description", content: "Detalhes e histórico do seu atleta." },
      { property: "og:title", content: "Detalhes do cliente" },
      { property: "og:description", content: "Histórico e ficha do seu jogador." },
    ],
  }),
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const save = useGame((s) => s.save)!;
  const j = save.jogadores.find((x) => x.id === id);
  if (!j) {
    return (
      <Screen title="Cliente" back="/jogo/meus">
        <p className="text-sm text-zinc-500">Jogador não encontrado.</p>
      </Screen>
    );
  }
  const clube = save.clubes.find((c) => c.id === j.clubeAtualId);

  return (
    <Screen title={`${j.nome} ${j.sobrenome}`} subtitle="Cliente da agência" back="/jogo/meus">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-lg bg-zinc-800 text-base font-semibold text-zinc-300">
            {j.nome[0]}{j.sobrenome[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-zinc-100">{j.nome} {j.sobrenome}</div>
            <div className="text-[11px] text-zinc-500">
              {j.idade} anos · {j.posicao} · {j.peDominante}
            </div>
            <div className="text-[11px] text-zinc-500">
              {clube ? `Atualmente em ${clube.nome}` : "Sem clube profissional"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Potencial</div>
            <div className="text-sm font-medium text-emerald-500">{textoPotencial(j)}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <AttributeBar label="Velocidade" value={j.atributos.velocidade} />
          <AttributeBar label="Passe" value={j.atributos.passe} />
          <AttributeBar label="Finalização" value={j.atributos.finalizacao} />
          <AttributeBar label="Defesa" value={j.atributos.defesa} />
          <AttributeBar label="Físico" value={j.atributos.fisico} />
          <AttributeBar label="Técnica" value={j.atributos.tecnica} />
          <AttributeBar label="Mental" value={j.atributos.mental} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-zinc-900 p-3 ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Valor</div>
          <div className="text-sm font-medium text-emerald-500">
            R$ {j.valorMercado.toLocaleString("pt-BR")}
          </div>
        </div>
        <div className="rounded-lg bg-zinc-900 p-3 ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Salário</div>
          <div className="text-sm font-medium text-zinc-100">
            R$ {j.salario.toLocaleString("pt-BR")}
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Histórico</h2>
      <div className="space-y-2">
        {j.historico.length === 0 ? (
          <div className="rounded-lg bg-zinc-900 p-3 text-xs text-zinc-500 ring-1 ring-white/5">
            Sem eventos registrados.
          </div>
        ) : (
          j.historico
            .slice()
            .reverse()
            .map((h, idx) => (
              <div key={idx} className="rounded-lg bg-zinc-900 p-3 ring-1 ring-white/5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {MESES_PT[h.mes - 1]}/{h.ano} · Semana {h.semana}
                </div>
                <div className="mt-0.5 text-xs text-zinc-200">{h.texto}</div>
              </div>
            ))
        )}
      </div>
    </Screen>
  );
}
