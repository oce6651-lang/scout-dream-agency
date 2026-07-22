import type { ReactNode } from "react";

export function PrimaryCTA({
  onClick,
  children,
  disabled,
  variant = "primary",
}: {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "w-full rounded-xl px-3 py-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-zinc-100 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
      : variant === "danger"
      ? "bg-red-600/90 text-white ring-1 ring-red-500/50"
      : "bg-zinc-900 ring-1 ring-white/10 text-zinc-200";
  return (
    <button className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
