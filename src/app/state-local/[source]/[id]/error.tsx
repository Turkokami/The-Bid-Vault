"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";

export default function StateLocalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8 text-amber-50">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-100/80">Opportunity detail issue</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">
        We could not load this opportunity detail page right now.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7">
        The original source may be temporarily unavailable, or this record may need to be refreshed.
        Try again, or go back to the state search page and reopen the source portal directly.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          Try again
        </button>
        <Link href="/state-local" className={buttonStyles({ variant: "ghost", size: "md" })}>
          Back to State & Local
        </Link>
      </div>
    </div>
  );
}
