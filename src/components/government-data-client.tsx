"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import {
  readSavedNaicsCodeLists,
  removeNaicsCodeList,
  saveNaicsCodeList,
  type SavedNaicsCodeList,
} from "@/lib/demo-category-store";
import type {
  DataSourceCoverage,
  IndustryRecommendation,
  SyncActivity,
} from "@/lib/demo-data";
import { industryRecommendations } from "@/lib/demo-data";
import {
  forceRefreshGovernmentData,
  getMergedGovDataForQuery,
  getMergedSyncState,
} from "@/lib/demo-contract-store";
import type { SamKeywordMode, SamOpportunityRecord } from "@/lib/server/sam-search";

type SearchSamStatus = "all" | "available" | "closing-soon" | "needs-review";
type SearchSamSort = "due-soon" | "newest" | "agency" | "title";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseMultiValue(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseKeywordTerms(value: string, mode: SamKeywordMode) {
  const input = value.trim();
  if (!input) {
    return [];
  }

  if (mode === "exact") {
    return [input];
  }

  return input
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildSamSearchHref(params: {
  keywords?: string;
  keywordMode?: SamKeywordMode;
  industry?: string;
  naics?: string;
  agency?: string;
  state?: string;
  status?: SearchSamStatus;
  sort?: SearchSamSort;
}) {
  const search = new URLSearchParams();

  if (params.keywords) search.set("keywords", params.keywords);
  if (params.keywordMode && params.keywordMode !== "all") search.set("keywordMode", params.keywordMode);
  if (params.industry) search.set("industry", params.industry);
  if (params.naics) search.set("naics", params.naics);
  if (params.agency) search.set("agency", params.agency);
  if (params.state) search.set("state", params.state);
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.sort && params.sort !== "due-soon") search.set("sort", params.sort);

  const query = search.toString();
  return query ? `/sam-search?${query}` : "/sam-search";
}

function dedupeRecords(records: SamOpportunityRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      normalize(record.title),
      normalize(record.agency),
      normalize(record.naicsCode),
      normalize(record.state),
      normalize(record.responseDeadline),
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function filterRecords(
  records: SamOpportunityRecord[],
  keywords: string[],
  keywordMode: SamKeywordMode,
  naics?: string,
  agency?: string,
  state?: string,
  status: SearchSamStatus = "all",
) {
  const naicsCodes = parseMultiValue(naics);

  return records.filter((record) => {
    const matchesNaics = naicsCodes.length > 0 ? naicsCodes.includes(record.naicsCode) : true;
    const matchesAgency = agency ? record.agency === agency : true;
    const matchesState = state ? record.state === state : true;
    const matchesStatus =
      status === "all"
        ? true
        : status === "available"
          ? record.availabilityStatus === "Available"
          : status === "closing-soon"
            ? record.availabilityStatus === "Closing Soon"
            : record.availabilityStatus === "Needs Review";
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
      (keywordMode === "exact"
        ? blob.includes(keywords.join(" ").toLowerCase())
        : keywordMode === "any"
          ? keywords.some((keyword) => blob.includes(keyword.toLowerCase()))
          : keywords.every((keyword) => blob.includes(keyword.toLowerCase())));

    return matchesNaics && matchesAgency && matchesState && matchesStatus && matchesKeywords;
  });
}

function sortRecords(records: SamOpportunityRecord[], sort: SearchSamSort) {
  const sorted = [...records];

  sorted.sort((left, right) => {
    if (sort === "newest") {
      const rightDate = "postedDate" in right && typeof right.postedDate === "string"
        ? parseDate(right.postedDate)
        : parseDate(right.responseDeadline);
      const leftDate = "postedDate" in left && typeof left.postedDate === "string"
        ? parseDate(left.postedDate)
        : parseDate(left.responseDeadline);
      return rightDate - leftDate;
    }

    if (sort === "agency") {
      return left.agency.localeCompare(right.agency) || left.title.localeCompare(right.title);
    }

    if (sort === "title") {
      return left.title.localeCompare(right.title);
    }

    return parseDate(left.responseDeadline) - parseDate(right.responseDeadline);
  });

  return sorted;
}

function availabilityBadgeClass(status: SamOpportunityRecord["availabilityStatus"]) {
  if (status === "Available") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "Closing Soon") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  return "border-white/10 bg-white/5 text-slate-200";
}

export function GovernmentDataClient({
  initialRecords,
  initialSources,
  initialActivities,
  initialKeywords,
  initialKeywordMode = "all",
  initialNaics,
  initialAgency,
  initialState,
  initialIndustry,
  initialStatus = "all",
  initialSort = "due-soon",
  initialErrorMessage,
  liveConfigured,
}: {
  initialRecords: SamOpportunityRecord[];
  initialSources: DataSourceCoverage[];
  initialActivities: SyncActivity[];
  initialKeywords: string[];
  initialKeywordMode?: SamKeywordMode;
  initialNaics?: string;
  initialAgency?: string;
  initialState?: string;
  initialIndustry?: string;
  initialStatus?: SearchSamStatus;
  initialSort?: SearchSamSort;
  initialErrorMessage?: string;
  liveConfigured: boolean;
}) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [records, setRecords] = useState<SamOpportunityRecord[]>(initialRecords);
  const [sources, setSources] = useState(initialSources);
  const [activities, setActivities] = useState(initialActivities);
  const [lastForcedRefreshAt, setLastForcedRefreshAt] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage ?? "");
  const [searchIndustry, setSearchIndustry] = useState(initialIndustry ?? "");
  const [searchKeywords, setSearchKeywords] = useState(initialKeywords.join(", "));
  const [keywordMode, setKeywordMode] = useState<SamKeywordMode>(initialKeywordMode);
  const [searchNaics, setSearchNaics] = useState(initialNaics ?? "");
  const [searchAgency, setSearchAgency] = useState(initialAgency ?? "");
  const [searchState, setSearchState] = useState(initialState ?? "");
  const [searchStatus, setSearchStatus] = useState<SearchSamStatus>(initialStatus);
  const [sortBy, setSortBy] = useState<SearchSamSort>(initialSort);
  const [isLiveConfigured, setIsLiveConfigured] = useState(liveConfigured);
  const [savedCodeLists, setSavedCodeLists] = useState<SavedNaicsCodeList[]>([]);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    const syncGovData = async () => {
      try {
        const next = await getMergedGovDataForQuery({
          keywords: searchKeywords,
          keywordMode,
          industry: searchIndustry,
          naics: searchNaics,
          agency: searchAgency,
          state: searchState,
          status: searchStatus,
          sort: sortBy,
        });
        setRecords(next.records);
      } catch {
        setErrorMessage("We could not load live SAM records right now.");
      }
    };

    const syncSourceState = async () => {
      try {
        const next = await getMergedSyncState({
          keywords: searchKeywords,
          keywordMode,
          industry: searchIndustry,
          naics: searchNaics,
          agency: searchAgency,
          state: searchState,
          status: searchStatus,
          sort: sortBy,
        });
        setSources(next.sources);
        setActivities(next.activities);
        setLastForcedRefreshAt(next.lastForcedRefreshAt);
        setErrorMessage(next.errorMessage ?? "");
        setIsLiveConfigured(next.liveConfigured);
      } catch {
        setErrorMessage("We could not load live SAM source status right now.");
      }
    };

    syncGovData();
    syncSourceState();
    const syncSavedLists = () => setSavedCodeLists(readSavedNaicsCodeLists());
    syncSavedLists();
    window.addEventListener("bid-vault-gov-data-updated", syncGovData);
    window.addEventListener("bid-vault-sync-updated", syncSourceState);
    window.addEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);

    return () => {
      window.removeEventListener("bid-vault-gov-data-updated", syncGovData);
      window.removeEventListener("bid-vault-sync-updated", syncSourceState);
      window.removeEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);
    };
  }, [keywordMode, searchAgency, searchIndustry, searchKeywords, searchNaics, searchState, searchStatus, sortBy]);

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

    return scored.map((item) => item.recommendation).slice(0, 3);
  }, [searchIndustry]);

  const recommendedNaicsCodes = useMemo(
    () =>
      Array.from(
        new Set(industryMatches.flatMap((recommendation) => recommendation.codes.map((code) => code.naicsCode))),
      ),
    [industryMatches],
  );

  const appliedKeywordTerms = useMemo(
    () => parseKeywordTerms(searchKeywords, keywordMode),
    [keywordMode, searchKeywords],
  );
  const appliedNaicsCodes = useMemo(() => parseMultiValue(searchNaics), [searchNaics]);

  const filteredResults = useMemo(
    () =>
      sortRecords(
        dedupeRecords(
          filterRecords(
            records,
            appliedKeywordTerms,
            keywordMode,
            searchNaics,
            searchAgency,
            searchState,
            searchStatus,
          ),
        ),
        sortBy,
      ),
    [appliedKeywordTerms, keywordMode, records, searchAgency, searchNaics, searchState, searchStatus, sortBy],
  );

  const availableCount = useMemo(
    () => dedupeRecords(records).filter((record) => record.availabilityStatus === "Available").length,
    [records],
  );

  const applySearch = (next?: Partial<{
    keywords: string;
    keywordMode: SamKeywordMode;
    industry: string;
    naics: string;
    agency: string;
    state: string;
    status: SearchSamStatus;
    sort: SearchSamSort;
  }>) => {
    const href = buildSamSearchHref({
      keywords: next?.keywords ?? searchKeywords,
      keywordMode: next?.keywordMode ?? keywordMode,
      industry: next?.industry ?? searchIndustry,
      naics: next?.naics ?? searchNaics,
      agency: next?.agency ?? searchAgency,
      state: next?.state ?? searchState,
      status: next?.status ?? searchStatus,
      sort: next?.sort ?? sortBy,
    });

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Search SAM
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Search or browse federal contracts in one clean place.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Start by typing what your business does, or browse all available opportunities and scroll through the list freely.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchKeywords("");
                setSearchIndustry("");
                setSearchNaics("");
                setSearchAgency("");
                setSearchState("");
                setSearchStatus("available");
                setSortBy("due-soon");
                setErrorMessage("");
                applySearch({
                  keywords: "",
                  industry: "",
                  naics: "",
                  agency: "",
                  state: "",
                  status: "available",
                  keywordMode: "all",
                  sort: "due-soon",
                });
              }}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Browse all available contracts
            </button>
            <button
              type="button"
              onClick={() => {
                void forceRefreshGovernmentData({
                  keywords: searchKeywords,
                  keywordMode,
                  industry: searchIndustry,
                  naics: searchNaics,
                  agency: searchAgency,
                  state: searchState,
                  status: searchStatus,
                  sort: sortBy,
                })
                  .then((snapshot) => {
                    setRecords(snapshot.records);
                    setSources(snapshot.sources);
                    setActivities(snapshot.activities);
                    setLastForcedRefreshAt(snapshot.activities[0]?.ranAt);
                    setErrorMessage(snapshot.errorMessage ?? "");
                    setIsLiveConfigured(snapshot.liveConfigured);
                    setStatusMessage("Live SAM records refreshed.");
                  })
                  .catch(() => {
                    setErrorMessage("We could not refresh live SAM records right now.");
                  });
              }}
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Refresh SAM records now
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <span>{statusMessage}</span>
            <Link
              href="/sam-search"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Refresh this page
            </Link>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                Narrow results
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use these filters to quickly find contracts that match your business.
              </p>
            </div>
            {isNavigating ? (
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                Searching...
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Search words</span>
              <p className="text-xs leading-5 text-slate-400">
                Type what you do. Example: pest control, landscaping, roofing.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Match all words" },
                  { value: "any", label: "Match any word" },
                  { value: "exact", label: "Match exact phrase" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setKeywordMode(option.value as SamKeywordMode)}
                    className={buttonStyles({
                      variant: keywordMode === option.value ? "primary" : "ghost",
                      size: "sm",
                    })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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

            <label className="space-y-2 text-sm text-slate-200">
              <span>Status</span>
              <select
                name="status"
                value={searchStatus}
                onChange={(event) => setSearchStatus(event.target.value as SearchSamStatus)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              >
                <option value="all">All records</option>
                <option value="available">Available now</option>
                <option value="closing-soon">Closing soon</option>
                <option value="needs-review">Needs review</option>
              </select>
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
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="flex-1 space-y-2 text-sm text-slate-200">
                    <span>Save these as your code list</span>
                    <input
                      value={newListName}
                      onChange={(event) => setNewListName(event.target.value)}
                      placeholder="Example: Pest Control Search Codes"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      saveNaicsCodeList(
                        newListName || `${searchIndustry || "My"} search codes`,
                        recommendedNaicsCodes,
                      );
                      setNewListName("");
                    }}
                    className={buttonStyles({ variant: "primary", size: "md" })}
                  >
                    Save code list
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {savedCodeLists.length > 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Your saved code lists</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Apply a saved list to instantly reuse your preferred codes in Search SAM.
              </p>
              <div className="mt-4 space-y-3">
                {savedCodeLists.map((list) => (
                  <div
                    key={list.id}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-white">{list.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{list.codes.join(", ")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSearchNaics(list.codes.join(", "))}
                          className={buttonStyles({ variant: "secondary", size: "sm" })}
                        >
                          Apply list
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
            <button
              type="button"
              onClick={() => {
                setSearchKeywords("");
                setSearchIndustry("");
                setSearchNaics("");
                setSearchAgency("");
                setSearchState("");
                setSearchStatus("all");
                setSortBy("due-soon");
                applySearch({
                  keywords: "",
                  industry: "",
                  naics: "",
                  agency: "",
                  state: "",
                  status: "all",
                  keywordMode: "all",
                  sort: "due-soon",
                });
              }}
              className={buttonStyles({ variant: "ghost", size: "md" })}
            >
              Clear search
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Tip: leave the search blank and choose Available now if you want to scroll through all active opportunities. You can also reuse your saved code lists here anytime.
          </p>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                Search results
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                These are current federal opportunities you may be able to bid on.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-100">
                {filteredResults.length} matching {filteredResults.length === 1 ? "result" : "results"}
              </div>
              {appliedNaicsCodes.length > 0 ? (
                <div className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                  Using codes: {appliedNaicsCodes.join(", ")}
                </div>
              ) : null}

              <label className="space-y-1 text-sm text-slate-200">
                <span className="sr-only">Sort results</span>
                <select
                  name="sort"
                  value={sortBy}
                  onChange={(event) => {
                    const nextSort = event.target.value as SearchSamSort;
                    setSortBy(nextSort);
                    applySearch({ sort: nextSort });
                  }}
                  className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
                >
                  <option value="due-soon">Sort: due soonest</option>
                  <option value="newest">Sort: newest due date</option>
                  <option value="agency">Sort: agency</option>
                  <option value="title">Sort: title</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {records.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
                {isLiveConfigured
                  ? "No live SAM opportunities were returned right now. Try refreshing the page or broadening your filters."
                  : "Search SAM needs a live SAM.gov API key before it can load real federal opportunities."}
              </div>
            ) : null}

            {filteredResults.map((result) => (
              <Link
                key={result.id}
                href={`/sam-search/${encodeURIComponent(result.noticeId)}`}
                className="block rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <h2 className="text-lg font-semibold text-white">{result.title}</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {result.agency} / {result.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${availabilityBadgeClass(result.availabilityStatus)}`}
                  >
                    {result.availabilityStatus}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <div>
                    <p className="text-slate-500">Type of opportunity</p>
                    <p className="mt-1 text-white">{result.opportunityType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Industry Type (NAICS Code)</p>
                    <p className="mt-1 text-white">{result.naicsCode}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Due date</p>
                    <p className="mt-1 text-white">{result.responseDeadline}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">{result.synopsis}</p>
                <p className="mt-4 text-sm text-emerald-200">Open SAM Search detail</p>
              </Link>
            ))}

            {records.length > 0 && filteredResults.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
                No results yet. Try broad terms like &quot;cleaning&quot;, &quot;construction&quot;, or &quot;pest control&quot;, or use Browse all available contracts.
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Available to browse now</p>
          <p className="mt-3 text-3xl font-semibold text-white">{availableCount}</p>
          <p className="mt-2 text-sm text-slate-400">
            Use Browse all available contracts to scroll the full active list.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Connected federal sources</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {sources.filter((source) => source.status === "Connected").length}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Federal sources currently ready for search in this preview.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last manual refresh</p>
          <p className="mt-3 text-sm font-medium text-emerald-100">
            {lastForcedRefreshAt ?? activities[0]?.ranAt ?? "No manual refresh run yet"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Refresh anytime when you want the newest source preview.
          </p>
        </article>
      </section>
    </div>
  );
}
