import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Screen } from "@/components/game/Screen";
import { useGame } from "@/game/store";
import { AttributeBar } from "@/components/game/AttributeBar";
import { NIVEIS_OBSERVACAO, textoPotencial } from "@/game/engine/observation";
import { PrimaryCTA } from "@/components/game/PrimaryCTA";
import { chanceAssinatura } from "@/game/engine/signing";

export const Route = createFileRoute("/_game/jogo/jogador/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do jogador — Project Football Agent" },
      { name: "description", content: "Detalhes, observação e contratação de um talento." },
      { property: "og:title", content: "Ficha do jogador" },
      { property: "og:description", content: "Observe e assine com o atleta." },
    ],
  }),
  component: Ficha,
});

function Ficha() {
  const { id } = Route.useParams();
  const save = useGame((s) => s.save)!;
  const ultimo = useGame((s) => s.ultimoScouting);
  const observar = useGame((s) => s.observar);
  const assinar = useGame((s) => s.assinar);
  const navigate = useNavigate();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const j =
    ultimo?.jogadores.find((x) => x.id === id) ??
    save.jogadores.find((x) => x.id === id);

  if (!j) {
    return (
      <Screen title="Jogador" back="/jogo/explorar">
        <p className="text-sm text-zinc-500">Este atleta não está mais disponível.</p>
      </Screen>
    );
  }

  const p = chanceAssinatura(save.empresario, j);

  const doObservar = (nivel: 1 | 2 | 3) => {
    const r = observar(id, nivel);
    setMsg(r.ok ? { ok: true, text: "Observação concluída." } : { ok: false, text: r.msg ?? "Erro" });
  };
  const doAssinar = () => {
    const r = assinar(id);
    setMsg({ ok: r.ok, text: r.msg });
    if (r.ok) setTimeout(() => navigate({ to: "/jogo/meus" }), 900);
  };

  const eCliente = j.empresarioId === save.empresario.id;

  return (
    <Screen title={`${j.nome} ${j.sobrenome}`} subtitle="Ficha do atleta" back="/jogo/explorar">
      <div className="mb-4 rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-lg bg-zinc-800 text-base font-semibold text-zinc-300">
            {j.nome[0]}
            {j.sobrenome[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-zinc-100">
              {j.nome} {j.sobrenome}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">
              {j.idade} anos · {j.posicao} · {j.peDominante}
            </div>
            <div className="text-[11px] text-zinc-500">
              {j.cidade} - {j.estado} · {j.personalidade}
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
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Valor de mercado</span>
          <span className="font-medium text-zinc-200">
            R$ {j.valorMercado.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {!eCliente && (
        <>
          <div className="mb-4">
            <h2 className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
              Observação · Nível atual: {j.observacaoNivel}/3
            </h2>
            <div className="space-y-2">
              {NIVEIS_OBSERVACAO.map((n) => {
                const feito = j.observacaoNivel >= n.nivel;
                const podePagar = save.empresario.dinheiro >= n.custo;
                return (
                  <button
                    key={n.nivel}
                    onClick={() => doObservar(n.nivel)}
                    disabled={feito || !podePagar}
                    className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-3 text-left ring-1 ring-white/5 disabled:opacity-40"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-medium text-zinc-100">{n.nome}</div>
                      <div className="text-[11px] text-zinc-500">{n.descricao}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-emerald-500">
                        R$ {n.custo.toLocaleString("pt-BR")}
                      </div>
                      {feito && (
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                          Feito
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3 rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Chance de aceitar seu contrato</span>
              <span className="font-medium text-zinc-100">{Math.round(p * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-emerald-500" style={{ width: `${p * 100}%` }} />
            </div>
            {j.idade < 14 && (
              <div className="mt-2 text-[10px] text-zinc-500">
                Menor de idade — exige aprovação dos responsáveis.
              </div>
            )}
          </div>
        </>
      )}

      {msg ? (
        <div
          className={`mb-3 rounded-lg px-3 py-2 text-center text-xs ring-1 ${msg.ok ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" : "bg-red-500/10 text-red-400 ring-red-500/30"}`}
        >
          {msg.text}
        </div>
      ) : null}

      {!eCliente ? (
        <PrimaryCTA onClick={doAssinar}>Tentar assinar contrato</PrimaryCTA>
      ) : (
        <div className="rounded-xl bg-emerald-500/10 p-3 text-center text-xs text-emerald-400 ring-1 ring-emerald-500/30">
          Este atleta já é seu cliente.
        </div>
      )}
    </Screen>
  );
}
