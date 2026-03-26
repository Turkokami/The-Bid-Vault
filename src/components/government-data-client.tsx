"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  DataSourceCoverage,
  ExtractedContractRecord,
  IndustryRecommendation,
  SyncActivity,
  UploadedSourceDocument,
} from "@/lib/demo-data";
import { industryRecommendations } from "@/lib/demo-data";
import {
  addDemoGovUpload,
  forceRefreshGovernmentData,
  getMergedGovData,
  getMergedSyncState,
} from "@/lib/demo-contract-store";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseMultiValue(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function filterRecords(
  records: ExtractedContractRecord[],
  keywords: string[],
  naics?: string,
  agency?: string,
  state?: string,
) {
  const naicsCodes = parseMultiValue(naics);

  return records.filter((record) => {
    const matchesNaics = naicsCodes.length > 0 ? naicsCodes.includes(record.naicsCode) : true;
    const matchesAgency = agency ? record.agency === agency : true;
    const matchesState = state ? record.state === state : true;
    const blob = [
      record.title,
      record.synopsis,
      record.agency,
      record.location,
      record.opportunityType,
      ...record.keyTerms,
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) => blob.includes(keyword.toLowerCase()));

    return matchesNaics && matchesAgency && matchesState && matchesKeywords;
  });
}

export function GovernmentDataClient({
  initialDocuments,
  initialRecords,
  initialSources,
  initialActivities,
  initialKeywords,
  initialNaics,
  initialAgency,
  initialState,
  initialIndustry,
}: {
  initialDocuments: UploadedSourceDocument[];
  initialRecords: ExtractedContractRecord[];
  initialSources: DataSourceCoverage[];
  initialActivities: SyncActivity[];
  initialKeywords: string[];
  initialNaics?: string;
  initialAgency?: string;
  initialState?: string;
  initialIndustry?: string;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [records, setRecords] = useState(initialRecords);
  const [sources, setSources] = useState(initialSources);
  const [activities, setActivities] = useState(initialActivities);
  const [lastForcedRefreshAt, setLastForcedRefreshAt] = useState<string | undefined>(undefined);
  const [uploadMessage, setUploadMessage] = useState("");
  const [searchIndustry, setSearchIndustry] = useState(initialIndustry ?? "");
  const [searchKeywords, setSearchKeywords] = useState(initialKeywords.join(", "));
  const [searchNaics, setSearchNaics] = useState(initialNaics ?? "");
  const [searchAgency, setSearchAgency] = useState(initialAgency ?? "");
  const [searchState, setSearchState] = useState(initialState ?? "");

  useEffect(() => {
    const syncGovData = () => {
      const next = getMergedGovData();
      setDocuments(next.documents);
      setRecords(next.records);
    };

    const syncSourceState = () => {
      const next = getMergedSyncState();
      setSources(next.sources);
      setActivities(next.activities);
      setLastForcedRefreshAt(next.lastForcedRefreshAt);
    };

    syncGovData();
    syncSourceState();
    window.addEventListener("bid-vault-gov-data-updated", syncGovData);
    window.addEventListener("bid-vault-sync-updated", syncSourceState);

    return () => {
      window.removeEventListener("bid-vault-gov-data-updated", syncGovData);
      window.removeEventListener("bid-vault-sync-updated", syncSourceState);
    };
  }, []);

  const industryMatches = useMemo(() => {
    const query = normalize(searchIndustry);

    if (!query) {
      return [] as IndustryRecommendation[];
    }

    const scored = industryRecommendations
      .map((recommendation) => {
        const haystack = [
          recommendation.industry,
          recommendation.category,
          recommendation.summary,
          ...recommendation.codes.map((code) => `${code.naicsCode} ${code.title} ${code.fitReason}`),
        ]
          .join(" ")
          .toLowerCase();

        const score = query
          .split(/\s+/)
          .filter(Boolean)
          .reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);

        return { recommendation, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    return scored.map((item) => item.recommendation).slice(0, 2);
  }, [searchIndustry]);

  const recommendedNaicsCodes = useMemo(
    () =>
      Array.from(
        new Set(industryMatches.flatMap((recommendation) => recommendation.codes.map((code) => code.naicsCode))),
      ),
    [industryMatches],
  );

  const appliedKeywordTerms = useMemo(() => parseMultiValue(searchKeywords), [searchKeywords]);

  const results = useMemo(
    () => filterRecords(records, appliedKeywordTerms, searchNaics, searchAgency, searchState),
    [appliedKeywordTerms, records, searchAgency, searchNaics, searchState],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/90">
            Automated source coverage
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Keep government contract data fresh with scheduled syncs and a client force refresh.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/85">
            The Bid Vault is now modeled to monitor official sources like SAM.gov and
            USAspending on a recurring cadence. Clients can also trigger a manual refresh when
            they want the newest opportunities loaded into research immediately.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                forceRefreshGovernmentData();
                setUploadMessage(
                  "Force refresh completed. Fresh government contract records were added for client review.",
                );
              }}
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Force refresh data
            </button>
            <Link
              href="/government-data"
              className="rounded-full border border-emerald-200/20 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-white/5"
            >
              View latest imported records
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Connected sources</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {sources.filter((source) => source.status === "Connected").length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Imported records</p>
              <p className="mt-2 text-3xl font-semibold text-white">{records.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Last force refresh</p>
              <p className="mt-2 text-sm font-medium text-emerald-100">
                {lastForcedRefreshAt ?? "No manual refresh run yet"}
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Refresh activity</p>
          <div className="mt-5 space-y-4">
            {activities.slice(0, 4).map((activity) => (
              <article
                key={activity.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{activity.sourceName}</h3>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                    {activity.result}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{activity.runLabel}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {activity.ranAt} / {activity.recordsAdded} records added
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-400">{activity.notes}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Uploaded government contract data
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Search uploaded contract files to identify available opportunities.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Upload a demo government file and watch searchable extracted contract
            records appear immediately in the prototype.
          </p>

          <div className="mt-6 rounded-[1.75rem] border border-emerald-400/20 bg-slate-950/70 p-5">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  addDemoGovUpload();
                  setUploadMessage(
                    "Demo government data uploaded. New extracted opportunities were added to the search results.",
                  );
                }}
                className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Upload government data
              </button>
              <button
                type="button"
                onClick={() => {
                  forceRefreshGovernmentData();
                  setUploadMessage(
                    "Client force refresh completed. Fresh source data was added from the sync pipeline preview.",
                  );
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Force refresh source data
              </button>
            </div>
          </div>
          {uploadMessage ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <span>{uploadMessage}</span>
              <Link
                href="/government-data"
                className="rounded-full border border-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-100"
              >
                Refresh filters
              </Link>
            </div>
          ) : null}
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Source files
            </p>
            <Link
              href="/sync-center"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/5"
            >
              Open sync center
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {documents.map((document) => (
              <article
                key={document.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <h2 className="text-base font-semibold text-white">{document.fileName}</h2>
                <p className="mt-1 text-sm text-slate-400">{document.sourceAgency}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          action="/government-data"
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Multiple key terms</span>
              <input
                name="keywords"
                value={searchKeywords}
                onChange={(event) => setSearchKeywords(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Industry or service type</span>
              <input
                name="industry"
                value={searchIndustry}
                onChange={(event) => setSearchIndustry(event.target.value)}
                placeholder="Try: pest control, wildlife exclusion, bird deterrent"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>NAICS</span>
              <input
                name="naics"
                value={searchNaics}
                onChange={(event) => setSearchNaics(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Agency</span>
              <input
                name="agency"
                value={searchAgency}
                onChange={(event) => setSearchAgency(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>State</span>
              <input
                name="state"
                value={searchState}
                onChange={(event) => setSearchState(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
          </div>
          {industryMatches.length > 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Recommended industry codes</p>
                  <p className="mt-1 text-xs text-emerald-100/90">
                    Based on &quot;{searchIndustry}&quot;, we found likely-fit NAICS codes for this search.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchNaics(recommendedNaicsCodes.join(", "))}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Apply all codes to search
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {industryMatches.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{recommendation.industry}</p>
                    <p className="mt-1 text-xs text-emerald-200">{recommendation.category}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recommendation.codes.map((code) => (
                        <button
                          key={`${recommendation.id}-${code.naicsCode}`}
                          type="button"
                          onClick={() => {
                            const nextCodes = Array.from(
                              new Set([...parseMultiValue(searchNaics), code.naicsCode]),
                            );
                            setSearchNaics(nextCodes.join(", "));
                          }}
                          className="rounded-full border border-emerald-400/20 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-100 transition hover:bg-emerald-400/10"
                        >
                          {code.naicsCode} / apply
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Search uploaded data
            </button>
            <Link
              href="/government-data"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Reset search
            </Link>
          </div>
          {searchNaics ? (
            <p className="mt-4 text-xs text-slate-400">Active NAICS filter: {searchNaics}</p>
          ) : null}
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Search results
          </p>
          <div className="mt-5 space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/government-data/${result.id}`}
                className="block rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
              >
                <h2 className="text-lg font-semibold text-white">{result.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {result.agency} / {result.location} / {result.opportunityType}
                </p>
                <p className="mt-3 text-sm text-emerald-200">Open contract research</p>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Source coverage</p>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Auto-refresh daily / weekly with manual override
          </p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {sources.map((source) => (
            <article
              key={source.id}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{source.name}</h3>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  {source.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{source.description}</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cadence</p>
                  <p className="mt-1 text-slate-200">{source.cadence}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coverage</p>
                  <p className="mt-1 text-slate-200">{source.coverage}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Type</p>
                  <p className="mt-1 text-slate-200">{source.sourceType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last synced</p>
                  <p className="mt-1 text-slate-200">{source.lastSyncedAt}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={source.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-emerald-200 transition hover:text-emerald-100"
                >
                  Visit official source
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
