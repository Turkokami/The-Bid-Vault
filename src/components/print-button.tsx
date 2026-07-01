"use client";

export function PrintButton({ label = "Download summary" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/50 hover:bg-emerald-400/20 hover:text-white active:scale-95"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5V2h8v3" />
        <rect x="1" y="5" width="12" height="6" rx="1" />
        <path d="M3 11v1h8v-1" />
      </svg>
      {label}
    </button>
  );
}
