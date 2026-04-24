"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";

export default function StateLocalError({
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
      <p className="text-xs uppercase tracking-[0.35em] text-amber-100/80">State & local loading issue</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">
        We could not load this live state or local source right now.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7">
        The page is still part of the app, but the live source may be timing out or temporarily blocking the request.
        Try reloading, or go back to the State & Local hub and open the original government portal directly.
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
        <a
          href="https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx"
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: "ghost", size: "md" })}
        >
          Open WEBS directly
        </a>
      </div>
    </div>
  );
}
