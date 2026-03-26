import Image from "next/image";
import { WatchlistClient } from "@/components/watchlist-client";
import {
  getSavedContractsWithFallback,
  keywordTrackingGroups,
} from "@/lib/server/planning";
import { getViewerContext } from "@/lib/server/workspace";

export default async function WatchlistPage() {
  const viewer = await getViewerContext();
  const watchedContracts = await getSavedContractsWithFallback();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40">
            <Image
              src="/BVlogo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            Watchlist planning
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Watchlist
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Save contracts and track multiple keyword sets.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Watchlists now carry reminder lead times, planning notes, and rebid
          timing so saved contracts can flow directly into the planning calendar.
        </p>
      </section>

      <WatchlistClient
        initialSavedContracts={watchedContracts}
        keywordTrackingGroups={keywordTrackingGroups}
        mode={viewer.mode}
      />
    </div>
  );
}
