export function KpiCard({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const color = danger
    ? "text-red-500"
    : accent
      ? "text-emerald-500"
      : "text-zinc-100";
  return (
    <div
      className={`rounded-lg bg-zinc-900 p-3 ring-1 ${danger ? "ring-red-500/40" : "ring-white/5"}`}
    >
      <div className="mb-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-sm font-medium ${color}`}>{value}</div>
    </div>
  );
}
