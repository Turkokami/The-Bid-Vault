"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export function InfoTip({
  label = "What is this?",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[10px] font-semibold text-emerald-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        i
      </button>
      <span
        className={`absolute left-1/2 top-[calc(100%+0.65rem)] z-30 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-left text-xs leading-6 text-slate-200 shadow-[0_18px_36px_rgba(0,0,0,0.35)] ${
          open ? "block" : "hidden"
        }`}
      >
        {children}
      </span>
    </span>
  );
}
