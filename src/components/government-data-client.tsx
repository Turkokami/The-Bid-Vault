"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
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
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Uploaded file search
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Add your source files, then search the contract records inside them.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This page does two things: it helps you load contract source files and search the records found inside them. Source health and update history live in Sync Center.
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
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Upload files
              </button>
              <button
                type="button"
                onClick={() => {
                  forceRefreshGovernmentData();
                  setUploadMessage(
                    "Client force refresh completed. Fresh source data was added from the sync pipeline preview.",
                  );
                }}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                Refresh source data now
              </button>
              <Link
                href="/sync-center"
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Open Sync Center
              </Link>
            </div>
          </div>

          {uploadMessage ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <span>{uploadMessage}</span>
              <Link
                href="/government-data"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Refresh this page
              </Link>
            </div>
          ) : null}
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Uploaded files
            </p>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
              {documents.length} files
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {documents.map((document) => (
              <article
                key={document.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <h2 className="text-base font-semibold text-white">{document.fileName}</h2>
                <p className="mt-1 text-sm text-slate-400">{document.sourceAgency}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Source file
                </p>
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
              <span>Search words</span>
              <p className="text-xs leading-5 text-slate-400">
                Type what you do. Example: pest control, landscaping, roofing.
              </p>
              <input
                name="keywords"
                value={searchKeywords}
                onChange={(event) => setSearchKeywords(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span className="flex items-center gap-2">
                Industry or service type
                <InfoTip>Type the kind of work your business does. We will suggest matching industry codes for you.</InfoTip>
              </span>
              <input
                name="industry"
                value={searchIndustry}
                onChange={(event) => setSearchIndustry(event.target.value)}
                placeholder="Try: pest control, wildlife exclusion, bird deterrent"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                Industry Type (NAICS Code)
                <InfoTip>This is the industry classification the government uses to describe the type of work.</InfoTip>
              </span>
              <input
                name="naics"
                value={searchNaics}
                onChange={(event) => setSearchNaics(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Government agency</span>
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
                    Based on &quot;{searchIndustry}&quot;, we found likely industry codes for your search.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchNaics(recommendedNaicsCodes.join(", "))}
                  className={buttonStyles({ variant: "primary", size: "sm" })}
                >
                  Use all suggested codes
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
                          className={buttonStyles({ variant: "secondary", size: "sm" })}
                        >
                          {code.naicsCode} / use this code
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
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Search contracts
            </button>
            <Link
              href="/government-data"
              className={buttonStyles({ variant: "ghost", size: "md" })}
            >
              Clear search
            </Link>
          </div>
          {searchNaics ? (
            <p className="mt-4 text-xs text-slate-400">Active industry code filter: {searchNaics}</p>
          ) : null}
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Search results
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            These are current government opportunities you may be able to bid on.
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
            {results.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
                No results yet. Try broad terms like &quot;cleaning&quot;, &quot;construction&quot;, or &quot;pest control&quot;.
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Imported records</p>
          <p className="mt-3 text-3xl font-semibold text-white">{records.length}</p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Connected data sources</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {sources.filter((source) => source.status === "Connected").length}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last manual refresh</p>
          <p className="mt-3 text-sm font-medium text-emerald-100">
            {lastForcedRefreshAt ?? activities[0]?.ranAt ?? "No manual refresh run yet"}
          </p>
        </article>
      </section>
    </div>
  );
}
