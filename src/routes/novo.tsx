import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen } from "@/components/game/Screen";
import { PrimaryCTA } from "@/components/game/PrimaryCTA";
import { ESTADOS, cidadesDoEstado } from "@/game/data/brasil";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/novo")({
  head: () => ({
    meta: [
      { title: "Novo empresário — Project Football Agent" },
      { name: "description", content: "Crie seu empresário e sua agência de futebol." },
      { property: "og:title", content: "Criar empresário" },
      { property: "og:description", content: "Comece uma nova carreira em Project Football Agent." },
    ],
  }),
  component: NovoJogo,
});

function NovoJogo() {
  const navigate = useNavigate();
  const novoJogo = useGame((s) => s.novoJogo);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [estado, setEstado] = useState("RS");
  const [cidade, setCidade] = useState("Três Passos");
  const [nomeAgencia, setNomeAgencia] = useState("");

  const cidades = useMemo(() => cidadesDoEstado(estado), [estado]);

  const podeCriar = nome.trim() && sobrenome.trim() && nomeAgencia.trim() && cidade;

  const criar = () => {
    if (!podeCriar) return;
    novoJogo({
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      nacionalidade: "Brasileiro",
      estado,
      cidade,
      nomeAgencia: nomeAgencia.trim(),
    });
    navigate({ to: "/jogo" });
  };

  return (
    <Screen
      title="Novo empresário"
      subtitle="Criar carreira"
      back="/"
      bottom={
        <PrimaryCTA onClick={criar} disabled={!podeCriar}>
          Começar carreira →
        </PrimaryCTA>
      }
    >
      <div className="space-y-5">
        <FieldGroup title="Dados pessoais">
          <TwoCol>
            <Field label="Nome">
              <input
                className="input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João"
                maxLength={20}
              />
            </Field>
            <Field label="Sobrenome">
              <input
                className="input"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="Ex: Oliveira"
                maxLength={30}
              />
            </Field>
          </TwoCol>
          <Field label="Nacionalidade">
            <input className="input opacity-60" value="Brasileiro" disabled />
          </Field>
        </FieldGroup>

        <FieldGroup title="Localização">
          <TwoCol>
            <Field label="Estado">
              <select
                className="input"
                value={estado}
                onChange={(e) => {
                  const s = e.target.value;
                  setEstado(s);
                  const c = cidadesDoEstado(s);
                  setCidade(c[0] ?? "");
                }}
              >
                {ESTADOS.map((e) => (
                  <option key={e.sigla} value={e.sigla}>
                    {e.sigla} — {e.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cidade">
              <select className="input" value={cidade} onChange={(e) => setCidade(e.target.value)}>
                {cidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </TwoCol>
        </FieldGroup>

        <FieldGroup title="Agência">
          <Field label="Nome da agência">
            <input
              className="input"
              value={nomeAgencia}
              onChange={(e) => setNomeAgencia(e.target.value)}
              placeholder="Ex: Oliveira Sports"
              maxLength={30}
            />
          </Field>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Você começará com <span className="text-emerald-500">R$ 2.000</span>, prestígio 1 e
            sem clientes. Sua base será {cidade || "—"} - {estado}.
          </p>
        </FieldGroup>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: rgb(24 24 27);
          border: 1px solid rgb(255 255 255 / 0.08);
          border-radius: 0.5rem;
          padding: 0.65rem 0.75rem;
          color: rgb(244 244 245);
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: rgb(16 185 129); }
        select.input { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #71717a 50%), linear-gradient(135deg, #71717a 50%, transparent 50%); background-position: calc(100% - 14px) 50%, calc(100% - 8px) 50%; background-size: 6px 6px; background-repeat: no-repeat; padding-right: 28px; }
      `}</style>
    </Screen>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-4 ring-1 ring-white/5">
      <div className="mb-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      {children}
    </label>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
