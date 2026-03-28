"use client";

import { ReactNode } from "react";

export function InfoTip({
  label = "What is this?",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[10px] font-semibold text-emerald-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 hidden w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-left text-xs leading-6 text-slate-200 shadow-[0_18px_36px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block">
        {children}
      </span>
    </span>
  );
}
