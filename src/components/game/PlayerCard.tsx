import { Link } from "@tanstack/react-router";
import type { Jogador } from "@/game/types";
import { textoPotencial } from "@/game/engine/observation";

export function PlayerCard({ j, hrefBase }: { j: Jogador; hrefBase: "jogador" | "meus" }) {
  const media = Math.round(
    (j.atributos.velocidade + j.atributos.passe + j.atributos.finalizacao + j.atributos.defesa + j.atributos.fisico + j.atributos.tecnica + j.atributos.mental) / 7,
  );
  const livre = hrefBase === "meus" && !j.clubeAtualId;
  return (
    <Link
      to={hrefBase === "jogador" ? "/jogo/jogador/$id" : "/jogo/meus/$id"}
      params={{ id: j.id }}
      className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3 ring-1 ring-white/5 transition-transform active:scale-[0.99]"
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
        {j.nome[0]}
        {j.sobrenome[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-zinc-100">
            {j.nome} {j.sobrenome}
          </div>
          <span className="rounded-sm bg-emerald-500/10 px-1 text-[10px] font-medium text-emerald-500">
            {j.posicao}
          </span>
          {livre ? (
            <span className="rounded-sm bg-amber-500/10 px-1 text-[10px] font-medium text-amber-400">
              Livre
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-zinc-500">
          {j.idade} anos · {j.cidade}-{j.estado} · {j.peDominante}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-emerald-500" style={{ width: `${media}%` }} />
          </div>
          <span className="shrink-0 text-[10px] text-zinc-400">
            OVR {media} · POT {textoPotencial(j)}
          </span>
        </div>
      </div>
    </Link>
  );
}

