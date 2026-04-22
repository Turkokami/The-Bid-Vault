"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { StateLocalFilterSidebar } from "@/components/state-local-filter-sidebar";
import { StateLocalOpportunityCard } from "@/components/state-local-opportunity-card";
import { buttonStyles } from "@/components/ui/button";
import {
  readSavedNaicsCodeLists,
  removeNaicsCodeList,
  type SavedNaicsCodeList,
} from "@/lib/demo-category-store";
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
  pageEyebrow = "State & local opportunities",
  pageTitle = "State and local opportunities in a simpler view.",
  pageDescription = "This page helps you find contract opportunities from state and local government sources.",
  sourceLabel = "State and local sources",
  sourceDescription = "The original government portal or feed where these opportunities were found.",
  focusSourceCodes,
  enableLiveRefresh = false,
  refreshButtonLabel = "Refresh live records",
  refreshSuccessMessage = "Live opportunities refreshed.",
  refreshErrorMessage = "Live records could not refresh right now. Please try again.",
  resetFilters,
}: {
  initialOpportunities: NormalizedStateLocalOpportunity[];
  initialSources: StateLocalSourceSummary[];
  initialSyncLogs: StateLocalSourceSyncLog[];
  initialFilters: StateLocalFilters;
  pageEyebrow?: string;
  pageTitle?: string;
  pageDescription?: string;
  sourceLabel?: string;
  sourceDescription?: string;
  focusSourceCodes?: string[];
  enableLiveRefresh?: boolean;
  refreshButtonLabel?: string;
  refreshSuccessMessage?: string;
  refreshErrorMessage?: string;
  resetFilters?: StateLocalFilters;
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [sources, setSources] = useState(initialSources);
  const [syncLogs, setSyncLogs] = useState(initialSyncLogs);
  const [filters, setFilters] = useState(initialFilters);
  const [savedCount, setSavedCount] = useState(0);
  const [savedCodeLists, setSavedCodeLists] = useState<SavedNaicsCodeList[]>([]);
  const [refreshMessage, setRefreshMessage] = useState("");

  useEffect(() => {
    const sync = async () => {
      try {
        const snapshot = await getMergedStateLocalSnapshot();
        setOpportunities(snapshot.opportunities);
        setSources(snapshot.sources);
        setSyncLogs(snapshot.syncLogs);
        setRefreshMessage("");
      } catch {
        setRefreshMessage(
          "WEBS could not load live records right now. The page is still available, so you can try refreshing again.",
        );
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

  useEffect(() => {
    const syncSavedLists = () => setSavedCodeLists(readSavedNaicsCodeLists());
    syncSavedLists();
    window.addEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);
    return () => window.removeEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);
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
  const visibleSources = useMemo(
    () =>
      focusSourceCodes?.length
        ? sources.filter((source) => focusSourceCodes.includes(source.sourceCode))
        : sources,
    [focusSourceCodes, sources],
  );

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
              {enableLiveRefresh ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await forceRefreshStateLocalSource();
                      setRefreshMessage(refreshSuccessMessage);
                    } catch {
                      setRefreshMessage(refreshErrorMessage);
                    }
                  }}
                  className={buttonStyles({ variant: "primary", size: "md", fullWidth: true })}
                >
                  {refreshButtonLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setFilters(resetFilters ?? initialFilters)}
                className={buttonStyles({ variant: "ghost", size: "md", fullWidth: true })}
              >
                Clear filters
              </button>
            </div>
          </div>

          {savedCodeLists.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Saved code lists</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Apply your saved work categories to WEBS searches in one click.
              </p>
              <div className="mt-4 space-y-3">
                {savedCodeLists.map((list) => {
                  const websCodes = list.websCodes?.length ? list.websCodes : list.codes;
                  const visibleWebsCodes = websCodes.filter((code) => options.categoryCodes.includes(code));
                  const terms = list.searchTerms ?? [];
                  return (
                    <div key={list.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-white">{list.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        WEBS codes: {websCodes.join(", ")}
                      </p>
                      {terms.length ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Search words: {terms.slice(0, 5).join(", ")}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFilters((current) => ({
                              ...current,
                              categoryCodes: visibleWebsCodes,
                              keywords: terms.length ? terms.slice(0, 4).join(", ") : current.keywords,
                              page: 1,
                            }))
                          }
                          className={buttonStyles({ variant: "secondary", size: "sm" })}
                        >
                          Apply to WEBS
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNaicsCodeList(list.id)}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </StateLocalFilterSidebar>

        <div className="order-1 space-y-4 xl:order-2 xl:space-y-6">
          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur sm:p-6 xl:rounded-[2rem]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">{pageEyebrow}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {pageTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:leading-7">
                  {pageDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

            <div className="mt-5 space-y-3 rounded-[1.25rem] border border-emerald-400/15 bg-slate-950/60 p-3 xl:hidden">
              <label className="block text-sm font-medium text-white" htmlFor="mobile-webs-search">
                Search WEBS
              </label>
              <input
                id="mobile-webs-search"
                value={filters.keywords}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, keywords: event.target.value, page: 1 }))
                }
                placeholder="Try pest control, roofing, janitorial..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
              <div className="flex flex-wrap gap-2">
                <a href="#webs-results" className={buttonStyles({ variant: "primary", size: "sm" })}>
                  View results
                </a>
                <a href="#webs-filters" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  More filters
                </a>
              </div>
            </div>

            {refreshMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {refreshMessage}
              </div>
            ) : null}
          </section>

          <section className="hidden gap-4 md:grid-cols-3 xl:grid">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Where this came from</p>
              <p className="mt-3 text-lg font-semibold text-white">{sourceLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {sourceDescription}
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

          <section id="webs-results" className="scroll-mt-40 space-y-3 sm:space-y-4">
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
                  Choose a location view to focus the search on the state, county, or city where your team works.
                </p>
              </div>
              <Link href="/state-local" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                View source hub
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleSources.map((source) => (
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
