"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[government-data] page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-red-500/10 p-4">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-400">A server error occurred. Try reloading — it usually clears on the second attempt.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition">
          Try again
        </button>
        <Link href="/" className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:border-white/20 transition">
          Go home
        </Link>
      </div>
    </div>
  );
}
