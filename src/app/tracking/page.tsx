import { WatchlistClient } from "@/components/watchlist-client";
import { OpportunityAlertsClient } from "@/components/opportunity-alerts-client";
import {
  getSavedContractsWithFallback,
  keywordTrackingGroups,
} from "@/lib/server/planning";
import { getViewerContext } from "@/lib/server/workspace";
import { stateDirectory } from "@/lib/sources/state-registry";
import { TrackingTabs } from "@/components/tracking-tabs";

export default async function TrackingPage() {
  const viewer = await getViewerContext();
  const watchedContracts = await getSavedContractsWithFallback();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Tracking</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Watchlist & Alerts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
          Save contracts to your watchlist, track keyword searches, and manage deadline alerts — all in one place.
        </p>
      </section>

      <TrackingTabs
        savedContracts={watchedContracts}
        keywordTrackingGroups={keywordTrackingGroups}
        mode={viewer.mode}
        states={stateDirectory}
      />
    </div>
  );
}
