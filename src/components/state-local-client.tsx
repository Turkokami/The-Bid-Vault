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
import type { LocalDirectoryEntry } from "@/lib/sources/state-registry";
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
  savedCodeHeading = "Saved code lists",
  savedCodeDescription = "Apply your saved work categories to this search in one click.",
  savedCodeApplyLabel = "Apply saved codes",
  resetFilters,
  portalAssist,
  livePortalView,
  emptyStateMessage = 'No results yet. Try broad words like "pest control", "roofing", or "janitorial".',
  stateNavigator,
  showSourceHubSection = true,
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
  savedCodeHeading?: string;
  savedCodeDescription?: string;
  savedCodeApplyLabel?: string;
  resetFilters?: StateLocalFilters;
  portalAssist?: {
    eyebrow: string;
    title: string;
    description: string;
    note?: string;
    links: Array<{
      href: string;
      label: string;
      external?: boolean;
    }>;
  };
  livePortalView?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    openLabel: string;
    embedSrc?: string;
    note?: string;
    allowEmbed?: boolean;
    blockedMessage?: string;
  };
  emptyStateMessage?: string;
  stateNavigator?: {
    stateName: string;
    stateCode: string;
    statewideSources: StateLocalSourceSummary[];
    localSources: StateLocalSourceSummary[];
    localDirectoryEntries: LocalDirectoryEntry[];
    countySearchLinks: Array<{
      href: string;
      label: string;
    }>;
  };
  showSourceHubSection?: boolean;
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [sources, setSources] = useState(initialSources);
  const [syncLogs, setSyncLogs] = useState(initialSyncLogs);
  const [filters, setFilters] = useState(initialFilters);
  const [savedCount, setSavedCount] = useState(0);
  const [savedCodeLists, setSavedCodeLists] = useState<SavedNaicsCodeList[]>([]);
  const [refreshMessage, setRefreshMessage] = useState("");
  const searchLabel = focusSourceCodes?.includes("washington") ? "Search WEBS" : "Search opportunities";
  const refreshFailureMessage =
    focusSourceCodes?.includes("washington")
      ? "WEBS could not load live records right now. The page is still available, so you can try refreshing again."
      : "Live source records could not load right now. The page is still available, so you can try refreshing again.";

  useEffect(() => {
    const sync = async () => {
      try {
        const snapshot = await getMergedStateLocalSnapshot();
        setOpportunities(snapshot.opportunities);
        setSources(snapshot.sources);
        setSyncLogs(snapshot.syncLogs);
        setRefreshMessage("");
      } catch {
        setRefreshMessage(refreshFailureMessage);
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
  }, [refreshFailureMessage]);

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

  const renderSourceMode = (source: StateLocalSourceSummary) => {
    if (source.connectionMode === "portal-assisted") {
      return "Portal-assisted";
    }
    if (source.connectionMode === "planned" || source.status === "Planned") {
      return "Planned";
    }
    return "Live";
  };

  const buildSourceLocationHref = (sourceCode: string) => `/state-local/${sourceCode}`;

  return (
    <div className="space-y-8">
      {stateNavigator ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                {stateNavigator.stateName} search setup
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Start with statewide sources, then open county or city options if you need to go deeper.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                We keep each state page focused on the sources that matter most for that state. Open a statewide portal first, then drill into county and city sources only when they help the search.
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              {stateNavigator.stateCode} focus
            </span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Statewide sources</p>
              <div className="mt-4 space-y-3">
                {stateNavigator.statewideSources.map((source) => (
                  <div key={source.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{source.sourceName}</p>
                        <p className="mt-1 text-sm text-slate-400">{source.cadence}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          source.connectionMode === "portal-assisted"
                            ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                            : source.connectionMode === "live"
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-slate-950/70 text-slate-300"
                        }`}
                      >
                        {renderSourceMode(source)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{source.helperText}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={source.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonStyles({ variant: "secondary", size: "sm" })}
                      >
                        Open statewide source
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">County and city options</p>
              <div className="mt-4 space-y-4">
                {stateNavigator.localDirectoryEntries.length > 0 ? (
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      Popular local starting points in {stateNavigator.stateName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      These are the fastest local launch points for county and city contract hunting in this state.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {stateNavigator.localDirectoryEntries.map((entry) => (
                        <a
                          key={entry.slug}
                          href={entry.href}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonStyles({
                            variant: entry.sourceType === "portal" ? "secondary" : "ghost",
                            size: "sm",
                          })}
                        >
                          {entry.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {stateNavigator.localSources.length > 0 ? (
                  <div className="space-y-3">
                  {stateNavigator.localSources.map((source) => (
                    <div key={source.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{source.sourceName}</p>
                          <p className="mt-1 text-sm text-slate-400">{source.regionLabel ?? source.stateCode}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-300">
                          {source.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{source.helperText}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={buildSourceLocationHref(source.sourceCode)}
                          className={buttonStyles({ variant: "primary", size: "sm" })}
                        >
                          Open local view
                        </Link>
                        <a
                          href={source.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Open local source
                        </a>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                    This state page is ready for county and city rollout. Until we connect curated local sources here, use these quick county-level search links to jump straight into local contract hunting for this state.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {stateNavigator.countySearchLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {livePortalView ? (
        <section className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                {livePortalView.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {livePortalView.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {livePortalView.description}
              </p>
              {livePortalView.note ? (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {livePortalView.note}
                </p>
              ) : null}
            </div>
            <a
              href={livePortalView.href}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              {livePortalView.openLabel}
            </a>
          </div>

          {livePortalView.allowEmbed === false ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm font-medium text-white">Live portal access</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {livePortalView.blockedMessage ??
                  "This source blocks embedded viewing, so open the official portal in a new tab to review the live contract list."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={livePortalView.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "primary", size: "sm" })}
                >
                  {livePortalView.openLabel}
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/80">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <p className="text-sm font-medium text-white">Live portal view</p>
                <a
                  href={livePortalView.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  Open in new tab
                </a>
              </div>
              <iframe
                title={livePortalView.title}
                src={livePortalView.embedSrc ?? livePortalView.href}
                loading="lazy"
                className="h-[760px] w-full bg-white"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}
        </section>
      ) : null}

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
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">{savedCodeHeading}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {savedCodeDescription}
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
                          {savedCodeApplyLabel}
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
                {searchLabel}
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

          {portalAssist ? (
            <section className="rounded-[2rem] border border-amber-400/20 bg-amber-400/[0.06] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/90">{portalAssist.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{portalAssist.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{portalAssist.description}</p>
              {portalAssist.note ? (
                <p className="mt-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-6 text-slate-300">
                  {portalAssist.note}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                {portalAssist.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </section>
          ) : null}

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
                {emptyStateMessage}
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

          {showSourceHubSection ? (
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
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        source.connectionMode === "portal-assisted"
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                      }`}
                    >
                      {renderSourceMode(source)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{source.description}</p>
                  <div className="mt-4">
                    <a
                      href={source.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      Open original portal
                    </a>
                  </div>
                </article>
              ))}
            </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
