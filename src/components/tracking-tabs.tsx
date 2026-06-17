"use client";

import { useState } from "react";
import { WatchlistClient } from "@/components/watchlist-client";
import { OpportunityAlertsClient } from "@/components/opportunity-alerts-client";
import type { SavedContractPlanView } from "@/lib/server/planning";
import type { KeywordTrackingGroup } from "@/lib/demo-data";
import type { StateDirectoryEntry } from "@/lib/sources/state-registry";

type Tab = "watchlist" | "alerts";

export function TrackingTabs({
  savedContracts,
  keywordTrackingGroups,
  mode,
  states,
}: {
  savedContracts: SavedContractPlanView[];
  keywordTrackingGroups: KeywordTrackingGroup[];
  mode: "database" | "demo";
  states: StateDirectoryEntry[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-1.5">
        {(["watchlist", "alerts"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-[1.1rem] px-4 py-2.5 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-emerald-400/15 text-emerald-200 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "watchlist" ? "Saved Contracts" : "Alerts"}
          </button>
        ))}
      </div>

      {activeTab === "watchlist" && (
        <WatchlistClient
          initialSavedContracts={savedContracts}
          keywordTrackingGroups={keywordTrackingGroups}
          mode={mode}
        />
      )}

      {activeTab === "alerts" && (
        <OpportunityAlertsClient states={states} />
      )}
    </div>
  );
}
