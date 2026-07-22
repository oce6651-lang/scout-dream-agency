export function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-900 p-3 ring-1 ring-white/5">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-sm font-medium ${accent ? "text-emerald-500" : "text-zinc-100"}`}>
        {value}
      </div>
    </div>
  );
}
