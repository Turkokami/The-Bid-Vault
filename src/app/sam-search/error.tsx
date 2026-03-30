"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function SamSearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-rose-100/80">
        Search SAM error
      </p>
      <h1 className="mt-4 text-3xl font-semibold">We could not load Search SAM right now.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-rose-50/90">
        Try refreshing the page or opening Sync Center to check whether the federal source preview needs attention.
      </p>
      <p className="mt-3 text-xs text-rose-100/70">
        {error.message || "Unexpected page error"}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          Try again
        </button>
        <Link href="/sync-center" className={buttonStyles({ variant: "ghost", size: "md" })}>
          Open Sync Center
        </Link>
      </div>
    </div>
  );
}
