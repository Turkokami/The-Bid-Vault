"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { StateLocalFilterSidebar } from "@/components/state-local-filter-sidebar";
import { StateLocalOpportunityCard } from "@/components/state-local-opportunity-card";
import { buttonStyles } from "@/components/ui/button";
import {
  forceRefreshStateLocalSource,
  getMergedStateLocalSnapshot,
  readSavedStateLocalEntries,
} from "@/lib/demo-state-local-store";
import {
  buildStateLocalFilterOptions,
  filterStateLocalOpportunities,
  type StateLocalFilters,
} from "@/lib/state-local-search";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function StateLocalClient({
  initialOpportunities,
  initialSources,
  initialSyncLogs,
  initialFilters,
}: {
  initialOpportunities: NormalizedStateLocalOpportunity[];
  initialSources: StateLocalSourceSummary[];
  initialSyncLogs: StateLocalSourceSyncLog[];
  initialFilters: StateLocalFilters;
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [sources, setSources] = useState(initialSources);
  const [syncLogs, setSyncLogs] = useState(initialSyncLogs);
  const [filters, setFilters] = useState(initialFilters);
  const [savedCount, setSavedCount] = useState(0);
  const [refreshMessage, setRefreshMessage] = useState("");

  useEffect(() => {
    const sync = async () => {
      try {
        const snapshot = await getMergedStateLocalSnapshot();
        setOpportunities(snapshot.opportunities);
        setSources(snapshot.sources);
        setSyncLogs(snapshot.syncLogs);
      } finally {
        setSavedCount(readSavedStateLocalEntries().length);
      }
    };

    void sync();
    window.addEventListener("bid-vault-state-local-updated", sync);
    window.addEventListener("bid-vault-state-local-saved-updated", sync);

    return () => {
      window.removeEventListener("bid-vault-state-local-updated", sync);
      window.removeEventListener("bid-vault-state-local-saved-updated", sync);
    };
  }, []);

  const options = useMemo(() => buildStateLocalFilterOptions(opportunities), [opportunities]);
  const results = useMemo(
    () => filterStateLocalOpportunities(opportunities, filters),
    [filters, opportunities],
  );

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const currentPage = Math.min(Math.max(filters.page, 1), totalPages);
  const visibleResults = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const latestSync = syncLogs[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <StateLocalFilterSidebar
          {...filters}
          options={options}
          onKeywordsChange={(value) => setFilters((current) => ({ ...current, keywords: value, page: 1 }))}
          onToggleState={(value) => setFilters((current) => ({ ...current, states: toggleValue(current.states, value), page: 1 }))}
          onToggleSource={(value) => setFilters((current) => ({ ...current, sources: toggleValue(current.sources, value), page: 1 }))}
          onToggleOpportunityType={(value) => setFilters((current) => ({ ...current, opportunityTypes: toggleValue(current.opportunityTypes, value), page: 1 }))}
          onToggleEntity={(value) => setFilters((current) => ({ ...current, entities: toggleValue(current.entities, value), page: 1 }))}
          onToggleStatus={(value) => setFilters((current) => ({ ...current, statuses: toggleValue(current.statuses, value), page: 1 }))}
          onToggleCategoryCode={(value) => setFilters((current) => ({ ...current, categoryCodes: toggleValue(current.categoryCodes, value), page: 1 }))}
          onToggleRegistration={(value) => setFilters((current) => ({ ...current, registration: toggleValue(current.registration, value), page: 1 }))}
          onDueFromChange={(value) => setFilters((current) => ({ ...current, dueFrom: value, page: 1 }))}
          onDueToChange={(value) => setFilters((current) => ({ ...current, dueTo: value, page: 1 }))}
        >
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Quick actions</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await forceRefreshStateLocalSource();
                    setRefreshMessage("Washington opportunities refreshed from the live WEBS source.");
                  } catch {
                    setRefreshMessage("We could not refresh live WEBS records right now. Please try again.");
                  }
                }}
                className={buttonStyles({ variant: "primary", size: "md", fullWidth: true })}
              >
                Refresh live WEBS records
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    keywords: "",
                    states: ["WA"],
                    sources: ["WEBS"],
                    opportunityTypes: [],
                    entities: [],
                    statuses: [],
                    categoryCodes: [],
                    registration: [],
                    dueFrom: "",
                    dueTo: "",
                    sortBy: "dueDate",
                    page: 1,
                  })
                }
                className={buttonStyles({ variant: "ghost", size: "md", fullWidth: true })}
              >
                Clear filters
              </button>
            </div>
          </div>
        </StateLocalFilterSidebar>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">State & local opportunities</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Washington opportunities in a simpler view than WEBS.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  This page helps you find contract opportunities from Washington and other state or local government sources.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  {results.length} opportunities found
                </div>
                <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  {savedCount} saved
                </div>
                <label className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    Sort by
                    <InfoTip>Due date shows what needs attention first. Newest first shows the latest postings.</InfoTip>
                  </span>
                  <select
                    value={filters.sortBy}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        sortBy:
                          event.target.value === "postedDate"
                            ? "postedDate"
                            : event.target.value === "relevance"
                              ? "relevance"
                              : "dueDate",
                      }))
                    }
                    className="bg-transparent text-sm text-white outline-none"
                  >
                    <option value="dueDate">Due date</option>
                    <option value="postedDate">Newest first</option>
                    <option value="relevance">Best match</option>
                  </select>
                </label>
              </div>
            </div>

            {refreshMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {refreshMessage}
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Where this came from</p>
              <p className="mt-3 text-lg font-semibold text-white">WEBS</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Washington&apos;s Electronic Business Solution for many state and local opportunities.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Latest sync</p>
              <p className="mt-3 text-lg font-semibold text-white">{latestSync?.lastRunAt ?? "Not synced yet"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{latestSync?.notes ?? "State and local source sync history will appear here."}</p>
            </article>
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Need to register before bidding?</p>
              <p className="mt-3 text-lg font-semibold text-white">Some opportunities do</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The details page will tell you when the original source system may require registration.
              </p>
            </article>
          </section>

          <section className="space-y-4">
            {visibleResults.map((opportunity) => (
              <StateLocalOpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
            {visibleResults.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
                No results yet. Try broad words like &quot;pest control&quot;, &quot;roofing&quot;, or &quot;janitorial&quot;.
              </div>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">Page {currentPage} of {totalPages}</div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Previous page
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Next page
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Connected sources</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Washington WEBS is live first. Other state systems are staged for later connectors.
                </p>
              </div>
              <Link href="/state-local" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                View source hub
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {sources.map((source) => (
                <article key={source.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{source.sourceName}</p>
                      <p className="mt-1 text-sm text-slate-400">{source.stateCode} / {source.cadence}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{source.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
