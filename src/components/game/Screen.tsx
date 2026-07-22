import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Screen({
  title,
  subtitle,
  back,
  children,
  bottom,
}: {
  title?: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
  bottom?: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-zinc-950 text-zinc-400">
      <div className="px-4 pb-32 pt-6">
        {(title || back) && (
          <div className="mb-6 flex items-center gap-3">
            {back ? (
              <Link
                to={back}
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-900 ring-1 ring-white/5 text-zinc-300 hover:text-zinc-100"
                aria-label="Voltar"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : null}
            <div className="min-w-0 flex-1">
              {title ? (
                <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="text-[11px] uppercase tracking-widest text-zinc-500">{subtitle}</p>
              ) : null}
            </div>
          </div>
        )}
        {children}
      </div>
      {bottom ? (
        <div className="fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto max-w-md bg-zinc-950/85 p-4 backdrop-blur-md">{bottom}</div>
        </div>
      ) : null}
    </div>
  );
}
