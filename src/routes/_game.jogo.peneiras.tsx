import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/game/Screen";
import { useGame, limitePeneirasSemana } from "@/game/store";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_game/jogo/peneiras")({
  head: () => ({
    meta: [
      { title: "Peneiras — Project Football Agent" },
      { name: "description", content: "Inscreva atletas sem clube em peneiras de clubes profissionais." },
      { property: "og:title", content: "Peneiras" },
      { property: "og:description", content: "Coloque seus atletas na vitrine dos clubes." },
    ],
  }),
  component: Peneiras,
});

function Peneiras() {
  const save = useGame((s) => s.save)!;
  const listar = useGame((s) => s.listarPeneiras);
  const inscrever = useGame((s) => s.inscreverPeneira);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashOk, setFlashOk] = useState(true);

  const semClube = useMemo(
    () =>
      save.jogadores.filter(
        (j) =>
          j.empresarioId === save.empresario.id &&
          !j.clubeAtualId &&
          !j.aposentado,
      ),
    [save.jogadores, save.empresario.id],
  );

  const [selecionado, setSelecionado] = useState<string | null>(
    semClube[0]?.id ?? null,
  );
  const jogador = semClube.find((x) => x.id === selecionado) ?? null;
  const opcoes = jogador ? listar(jogador.id) : [];

  const limite = limitePeneirasSemana(save.agencia.nivel);
  const restantes = Math.max(0, limite - save.peneirasNaSemana);

  const rodar = (clubeId: string) => {
    if (!jogador) return;
    const r = inscrever(jogador.id, clubeId);
    setFlashOk(r.ok);
    setFlash(r.msg);
    setTimeout(() => setFlash(null), 3200);
  };

  return (
    <Screen title="Peneiras" subtitle="Vitrine para clubes" back="/jogo">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Peneiras restantes</div>
          <div className="text-sm font-medium text-emerald-500">{restantes} / {limite}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Sem clube</div>
          <div className="text-sm font-medium text-zinc-100">{semClube.length}</div>
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-zinc-500">
        Jogadores desconhecidos precisam de vitrine. Inscreva-os em peneiras para gerar propostas de clubes compatíveis.
      </p>

      {semClube.length === 0 ? (
        <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
          Nenhum atleta sem clube na sua agência.
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {semClube.map((j) => {
              const ativo = j.id === selecionado;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelecionado(j.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left ring-1 transition ${
                    ativo
                      ? "bg-emerald-500/10 ring-emerald-500/40"
                      : "bg-zinc-900 ring-white/5"
                  }`}
                >
                  <div className="text-[11px] font-medium text-zinc-100">
                    {j.nome} {j.sobrenome}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {j.idade}a · {j.posicao}
                  </div>
                </button>
              );
            })}
          </div>

          {jogador ? (
            jogador.ultimaTransferenciaAno === save.tempo.ano ? (
              <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-amber-400 ring-1 ring-amber-500/20">
                {jogador.nome} já teve transferência neste ano. Aguarde a próxima temporada.
              </div>
            ) : opcoes.length === 0 ? (
              <div className="rounded-xl bg-zinc-900 p-4 text-center text-xs text-zinc-500 ring-1 ring-white/5">
                Nenhum clube abriu peneiras compatíveis. Faça observações para atrair olhares.
              </div>
            ) : (
              <div className="space-y-2">
                {opcoes.map((o) => {
                  const semSaldo = save.empresario.dinheiro < o.custo;
                  const semTurno = restantes <= 0;
                  const disabled = semSaldo || semTurno;
                  return (
                    <button
                      key={o.clubeId}
                      onClick={() => rodar(o.clubeId)}
                      disabled={disabled}
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-900 p-4 text-left ring-1 ring-white/5 transition-transform active:scale-[0.99] disabled:opacity-40"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-medium text-zinc-100">{o.clubeNome}</div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">
                          Nível do clube {o.nivelClube} · Chance {Math.round(o.chance * 100)}%
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-emerald-500">
                          R$ {o.custo.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Inscrição</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : null}
        </>
      )}

      {flash ? (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-center text-xs ring-1 ${
            flashOk
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
              : "bg-red-500/10 text-red-400 ring-red-500/30"
          }`}
        >
          {flash}
        </div>
      ) : null}
    </Screen>
  );
}
