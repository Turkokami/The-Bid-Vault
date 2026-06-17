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
  const popoverRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClose = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClose);
    document.addEventListener("touchstart", handleClose);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("touchstart", handleClose);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Flip popover direction if it would go off the bottom of the viewport
  const [flipUp, setFlipUp] = useState(false);
  useEffect(() => {
    if (!open || !popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    setFlipUp(rect.bottom > window.innerHeight - 20);
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

      {open && (
        <>
          {/* Full-screen tap-to-close backdrop on mobile */}
          <span
            className="fixed inset-0 z-20 lg:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <span
            ref={popoverRef}
            role="tooltip"
            className={`absolute z-30 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/98 px-4 py-3 text-left text-xs leading-6 text-slate-200 shadow-[0_18px_36px_rgba(0,0,0,0.45)] ${
              flipUp
                ? "bottom-[calc(100%+0.65rem)] top-auto"
                : "top-[calc(100%+0.65rem)]"
            } left-1/2 -translate-x-1/2`}
          >
            {/* Close button — always visible on mobile */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white lg:hidden"
            >
              ×
            </button>
            {children}
          </span>
        </>
      )}
    </span>
  );
}
