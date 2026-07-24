import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useGame } from "@/game/store";
import { Screen } from "@/components/game/Screen";
import { KpiCard } from "@/components/game/KpiCard";
import { ActionTile } from "@/components/game/ActionTile";
import { PrimaryCTA } from "@/components/game/PrimaryCTA";
import { formatarData } from "@/game/engine/time";
import { limitePartidasSemana } from "@/game/engine/facilities";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_game/jogo/")({
  head: () => ({
    meta: [
      { title: "Painel — Project Football Agent" },
      { name: "description", content: "Seu escritório, jogadores, propostas e histórico." },
      { property: "og:title", content: "Painel da agência" },
      { property: "og:description", content: "Gerencie sua carreira de empresário." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const save = useGame((s) => s.save)!;
  const avancar = useGame((s) => s.avancarSemana);
  const navigate = useNavigate();
  const [flash, setFlash] = useState<string | null>(null);

  // Auto-navegar para resumo de fim de ano se pendente
  useEffect(() => {
    if (save.resumoPendente) {
      navigate({ to: "/jogo/fim-de-ano" });
    }
  }, [save.resumoPendente, navigate]);

  const clientes = save.jogadores.filter(
    (j) => j.empresarioId === save.empresario.id && !j.aposentado,
  );
  const propostasAtivas = save.propostas.length;
  const limite = limitePartidasSemana(save.agencia.instalacoes);
  const restantes = Math.max(0, limite - save.assistidosNaSemana);
  const dinheiro = save.empresario.dinheiro;
  const saldoDanger = dinheiro < 0;
  const saldoStr = `${dinheiro < 0 ? "-" : ""}R$ ${Math.abs(dinheiro).toLocaleString("pt-BR")}`;

  const doAvancar = () => {
    const { eventos, resumo } = avancar();
    if (resumo) return; // navegação acontece via useEffect
    if (eventos.length > 0) setFlash(eventos[0]);
    else setFlash("Semana avançada.");
    setTimeout(() => setFlash(null), 2500);
  };

  return (
    <Screen
      bottom={
        <div className="space-y-2">
          {flash ? (
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-[11px] text-emerald-400 ring-1 ring-emerald-500/30">
              {flash}
            </div>
          ) : null}
          <PrimaryCTA onClick={doAvancar}>
            Avançar Semana
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </PrimaryCTA>
        </div>
      }
    >
      <header className="mb-6 flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-400"
          >
            ← Menu
          </button>
          <h1 className="mt-1 text-lg font-semibold uppercase tracking-tight text-zinc-100">
            {save.agencia.nome}
          </h1>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">
            {save.agencia.cidade} - {save.empresario.estado}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-zinc-100">{save.tempo.ano}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            {formatarData(save.tempo)}
          </div>
        </div>
      </header>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <KpiCard
          label="Saldo"
          value={saldoStr}
          accent={!saldoDanger}
          danger={saldoDanger}
        />
        <KpiCard label="Prestígio" value={`${save.empresario.prestigio} · Nv ${save.empresario.nivel}`} />
        <KpiCard label="Atletas" value={String(clientes.length)} />
      </div>

      <div className="mb-6 rounded-lg bg-zinc-900 px-3 py-2 ring-1 ring-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Partidas restantes esta semana</span>
        <span className="text-xs font-medium text-emerald-500">{restantes} / {limite}</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <ActionTile
          to="/jogo/explorar"
          eyebrow="Scouting"
          title="Explorar Talentos"
          hint={`${restantes} restantes`}
          hintAccent
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
        <ActionTile
          to="/jogo/meus"
          eyebrow="Portfólio"
          title="Meus Jogadores"
          hint={clientes.length === 0 ? "Vazio" : `${clientes.length} atletas`}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <ActionTile
          to="/jogo/mercado"
          eyebrow="Mercado"
          title="Transferências"
          hint={propostasAtivas > 0 ? `${propostasAtivas} propostas` : "Sem propostas"}
          hintAccent={propostasAtivas > 0}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <ActionTile
          to="/jogo/agencia"
          eyebrow="Escritório"
          title="Minha Agência"
          hint={`Nível ${save.agencia.nivel} · ${save.funcionarios.length} func.`}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <ActionTile
          to="/jogo/peneiras"
          eyebrow="Vitrine"
          title="Peneiras"
          hint={`${clientes.filter((j) => !j.clubeAtualId).length} sem clube`}
          hintAccent={clientes.some((j) => !j.clubeAtualId)}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 12v2m8-6a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>}
        />
        <ActionTile
          to="/jogo/noticias"
          eyebrow="Mídia"
          title="Notícias"
          hint={`${save.noticias.length} publicações`}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
        />
        <ActionTile
          to="/jogo/calendario"
          eyebrow="Agenda"
          title="Calendário"
          hint={formatarData(save.tempo)}
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <ActionTile
          to="/jogo/historico"
          eyebrow="Arquivo"
          title="Histórico da Agência"
          hint="Todos os clientes"
          wide
          icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
      </div>
    </Screen>
  );
}
