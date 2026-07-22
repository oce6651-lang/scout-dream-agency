import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function ActionTile({
  to,
  eyebrow,
  title,
  hint,
  icon,
  wide,
  hintAccent,
}: {
  to: string;
  eyebrow: string;
  title: string;
  hint?: string;
  icon: ReactNode;
  wide?: boolean;
  hintAccent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex ${wide ? "col-span-2 flex-row items-center justify-between" : "h-32 flex-col justify-between"} rounded-xl bg-zinc-900 p-4 text-left ring-1 ring-white/5 transition-transform active:scale-[0.98]`}
    >
      {wide ? (
        <>
          <div className="flex items-center gap-3">
            <div className="text-zinc-500">{icon}</div>
            <span className="text-sm font-medium text-zinc-300">{title}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">{hint}</div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="shrink-0 text-emerald-500">{icon}</div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {eyebrow}
            </span>
          </div>
          <div className="text-sm font-medium leading-tight text-zinc-100">{title}</div>
          {hint ? (
            <div className={`text-[10px] ${hintAccent ? "text-emerald-500" : "text-zinc-500"}`}>
              {hint}
            </div>
          ) : null}
        </>
      )}
    </Link>
  );
}
