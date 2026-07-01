"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import {
  hydrateSavedCategoryPreferences,
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
  cacheSamSnapshot,
  forceRefreshGovernmentData,
  readAnyCachedSamSnapshot,
  readCachedSamSnapshot,
} from "@/lib/demo-contract-store";
import type {
  SamContractValueBand,
  SamKeywordMode,
  SamOpportunityRecord,
  SamSetAsideFilter,
} from "@/lib/server/sam-search";

type SearchSamStatus = "all" | "available" | "closing-soon" | "needs-review";
type SearchSamSort = "due-soon" | "newest" | "agency" | "title";
const setAsideTabs: Array<{ value: SamSetAsideFilter; label: string }> = [
  { value: "all", label: "All set-asides" },
  { value: "small-business", label: "Small business" },
  { value: "veteran", label: "Veteran only" },
  { value: "women-owned", label: "Women-owned" },
  { value: "8a", label: "8(a)" },
  { value: "hubzone", label: "HUBZone" },
];

const contractValueTabs: Array<{ value: SamContractValueBand; label: string }> = [
  { value: "all", label: "All sizes" },
  { value: "under-250k", label: "Under $250k" },
  { value: "under-1m", label: "Under $1M" },
  { value: "1m-10m", label: "$1M to $10M" },
  { value: "over-10m", label: "Over $10M" },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const stateNameToCode = new Map<string, string>([
  ["alabama", "al"],
  ["alaska", "ak"],
  ["arizona", "az"],
  ["arkansas", "ar"],
  ["california", "ca"],
  ["colorado", "co"],
  ["connecticut", "ct"],
  ["delaware", "de"],
  ["district of columbia", "dc"],
  ["florida", "fl"],
  ["georgia", "ga"],
  ["hawaii", "hi"],
  ["idaho", "id"],
  ["illinois", "il"],
  ["indiana", "in"],
  ["iowa", "ia"],
  ["kansas", "ks"],
  ["kentucky", "ky"],
  ["louisiana", "la"],
  ["maine", "me"],
  ["maryland", "md"],
  ["massachusetts", "ma"],
  ["michigan", "mi"],
  ["minnesota", "mn"],
  ["mississippi", "ms"],
  ["missouri", "mo"],
  ["montana", "mt"],
  ["nebraska", "ne"],
  ["nevada", "nv"],
  ["new hampshire", "nh"],
  ["new jersey", "nj"],
  ["new mexico", "nm"],
  ["new york", "ny"],
  ["north carolina", "nc"],
  ["north dakota", "nd"],
  ["ohio", "oh"],
  ["oklahoma", "ok"],
  ["oregon", "or"],
  ["pennsylvania", "pa"],
  ["rhode island", "ri"],
  ["south carolina", "sc"],
  ["south dakota", "sd"],
  ["tennessee", "tn"],
  ["texas", "tx"],
  ["utah", "ut"],
  ["vermont", "vt"],
  ["virginia", "va"],
  ["washington", "wa"],
  ["west virginia", "wv"],
  ["wisconsin", "wi"],
  ["wyoming", "wy"],
]);

const stateCodeToName = new Map(
  Array.from(stateNameToCode.entries()).map(([name, code]) => [code, name]),
);

function normalizeStateInput(value?: string) {
  const input = normalize(value ?? "");
  if (!input) {
    return "";
  }

  if (input.length === 2) {
    return input;
  }

  return stateNameToCode.get(input) ?? input;
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
  browse?: boolean;
  setAside?: SamSetAsideFilter;
  valueBand?: SamContractValueBand;
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
  if (params.browse) search.set("browse", "1");
  if (params.setAside && params.setAside !== "all") search.set("setAside", params.setAside);
  if (params.valueBand && params.valueBand !== "all") search.set("valueBand", params.valueBand);

  const query = search.toString();
  return query ? `/sam-search?${query}` : "/sam-search";
}

function buildSamDetailHref(record: SamOpportunityRecord, returnTo?: string) {
  const search = new URLSearchParams({
    noticeId: record.noticeId,
    title: record.title,
    agency: record.agency,
    location: record.location,
    naics: record.naicsCode,
    due: record.responseDeadline,
    type: record.opportunityType,
    status: record.availabilityStatus,
    sourceUrl: record.sourceUrl,
  });

  if (record.postedDate) search.set("posted", record.postedDate);
  if (record.updatedDate) search.set("updated", record.updatedDate);
  if (record.pscCode) search.set("psc", record.pscCode);
  if (record.office) search.set("office", record.office);
  if (record.setAside) search.set("setAside", record.setAside);
  if (record.estimatedValueLabel) search.set("estimatedValueLabel", record.estimatedValueLabel);
  if (record.synopsis) search.set("summary", record.synopsis);
  if (returnTo) search.set("returnTo", returnTo);

  return `/government-data/${encodeURIComponent(record.id)}?${search.toString()}`;
}

function buildDirectSamSearchUrl(params: {
  keywords?: string;
  agency?: string;
  state?: string;
  naics?: string;
}) {
  const search = new URLSearchParams();
  const keywordQuery = [params.keywords, params.agency, params.state, params.naics]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (keywordQuery) {
    search.set("keywords", keywordQuery);
  }

  search.set("index", "opp");
  return `https://sam.gov/search/?${search.toString()}`;
}

function dedupeRecords(records: SamOpportunityRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    const keys = [
      record.noticeId ? `notice:${normalize(record.noticeId)}` : "",
      record.sourceUrl ? `source:${normalize(record.sourceUrl)}` : "",
      [
        normalize(record.title),
        normalize(record.agency),
        normalize(record.naicsCode),
        normalize(record.location),
        normalize(record.responseDeadline),
      ].join("|"),
    ].filter(Boolean);

    const matched = keys.some((key) => seen.has(key));
    if (matched) {
      return false;
    }

    keys.forEach((key) => seen.add(key));
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
  setAside: SamSetAsideFilter = "all",
  valueBand: SamContractValueBand = "all",
) {
  const naicsCodes = parseMultiValue(naics);
  const normalizedState = normalizeStateInput(state);
  const stateText = normalize(state ?? "");

  return records.filter((record) => {
    const matchesNaics = naicsCodes.length > 0 ? naicsCodes.includes(record.naicsCode) : true;
    const matchesAgency = agency
      ? normalize(record.agency).includes(normalize(agency))
      : true;
    const recordState = normalize(record.state);
    const recordLocation = normalize(record.location);
    const recordStateName = stateCodeToName.get(recordState) ?? "";
    const matchesState = state
      ? recordState === normalizedState ||
        recordLocation.includes(stateText) ||
        recordLocation.includes(normalizedState) ||
        (recordStateName ? recordLocation.includes(recordStateName) : false) ||
        (recordStateName ? recordStateName.includes(stateText) : false)
      : true;
    const matchesStatus =
      status === "all"
        ? true
        : status === "available"
          ? record.availabilityStatus === "Available"
          : status === "closing-soon"
            ? record.availabilityStatus === "Closing Soon"
            : record.availabilityStatus === "Needs Review";
    const setAsideText = normalize(record.setAside);
    const matchesSetAside =
      setAside === "all"
        ? true
        : setAside === "small-business"
          ? setAsideText.includes("small business") || setAsideText.includes("sba")
          : setAside === "veteran"
            ? setAsideText.includes("veteran") || setAsideText.includes("sdvosb") || setAsideText.includes("service-disabled")
            : setAside === "women-owned"
              ? setAsideText.includes("women") || setAsideText.includes("wosb") || setAsideText.includes("edwosb")
              : setAside === "8a"
                ? setAsideText.includes("8(a)") || setAsideText.includes("8a")
                : setAside === "hubzone"
                  ? setAsideText.includes("hubzone")
                  : setAside === "minority"
                    ? setAsideText.includes("minority") || setAsideText.includes("sdb")
                    : setAsideText.includes("full and open") || setAsideText.includes("unrestricted") || setAsideText.includes("not set aside");
    const matchesValue =
      valueBand === "all"
        ? true
        : typeof record.estimatedValue === "number"
          ? valueBand === "under-250k"
            ? record.estimatedValue < 250000
            : valueBand === "under-1m"
              ? record.estimatedValue < 1000000
              : valueBand === "1m-10m"
                ? record.estimatedValue >= 1000000 && record.estimatedValue <= 10000000
                : record.estimatedValue > 10000000
          : false;
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

    return matchesNaics && matchesAgency && matchesState && matchesStatus && matchesSetAside && matchesValue && matchesKeywords;
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
  initialSetAside = "all",
  initialValueBand = "all",
  initialErrorMessage,
  liveConfigured,
  initialBrowseAll = false,
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
  initialSetAside?: SamSetAsideFilter;
  initialValueBand?: SamContractValueBand;
  initialErrorMessage?: string;
  liveConfigured: boolean;
  initialBrowseAll?: boolean;
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
  const [searchSetAside, setSearchSetAside] = useState<SamSetAsideFilter>(initialSetAside);
  const [searchValueBand, setSearchValueBand] = useState<SamContractValueBand>(initialValueBand);
  const [isLiveConfigured, setIsLiveConfigured] = useState(liveConfigured);
  const [browseAll, setBrowseAll] = useState(initialBrowseAll ?? false);
  const [resultsPage, setResultsPage] = useState(1);
  const [savedCodeLists, setSavedCodeLists] = useState<SavedNaicsCodeList[]>([]);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    const syncSavedLists = () => setSavedCodeLists(readSavedNaicsCodeLists());
    void hydrateSavedCategoryPreferences();
    syncSavedLists();
    window.addEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);

    return () => {
      window.removeEventListener("bid-vault-naics-code-lists-updated", syncSavedLists);
    };
  }, []);

  useEffect(() => {
    if (records.length === 0 || errorMessage) {
      return;
    }

    cacheSamSnapshot(
      {
        records,
        sources,
        activities,
        liveConfigured: isLiveConfigured,
      },
        {
          keywords: searchKeywords,
          keywordMode,
          industry: searchIndustry,
          naics: searchNaics,
          agency: searchAgency,
          state: searchState,
          status: searchStatus,
          sort: sortBy,
          browse: browseAll,
          setAside: searchSetAside,
          valueBand: searchValueBand,
        },
      );
  }, [
    activities,
    browseAll,
    errorMessage,
    isLiveConfigured,
    keywordMode,
    records,
    searchAgency,
    searchIndustry,
    searchKeywords,
      searchNaics,
      searchSetAside,
      searchState,
      searchStatus,
      searchValueBand,
      sortBy,
      sources,
    ]);

  useEffect(() => {
    if (records.length > 0) {
      return;
    }

    if (!errorMessage || !/rate limiting|429/i.test(errorMessage)) {
      return;
    }

    const cached = readCachedSamSnapshot({
      keywords: searchKeywords,
      keywordMode,
      industry: searchIndustry,
      naics: searchNaics,
      agency: searchAgency,
      state: searchState,
      status: searchStatus,
      sort: sortBy,
      browse: browseAll,
      setAside: searchSetAside,
      valueBand: searchValueBand,
    });

    if (!cached || cached.records.length === 0) {
      const anyCached = readAnyCachedSamSnapshot();
      if (!anyCached || anyCached.records.length === 0) {
        return;
      }

      const fallbackTimer = window.setTimeout(() => {
        setRecords(anyCached.records);
        setSources(anyCached.sources);
        setActivities(anyCached.activities);
        setStatusMessage(
          "SAM.gov is cooling down, so you are seeing the last successful federal result set while the service resets.",
        );
      }, 0);

      return () => window.clearTimeout(fallbackTimer);
    }

    const fallbackTimer = window.setTimeout(() => {
      setRecords(cached.records);
      setSources(cached.sources);
      setActivities(cached.activities);
      setStatusMessage("Showing your last successful SAM results while SAM.gov cools down.");
    }, 0);

    return () => window.clearTimeout(fallbackTimer);
  }, [
    browseAll,
    errorMessage,
    keywordMode,
    records.length,
    searchAgency,
    searchIndustry,
    searchKeywords,
    searchNaics,
    searchSetAside,
    searchState,
    searchStatus,
    searchValueBand,
    sortBy,
  ]);

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
  const currentSearchHref = useMemo(
    () =>
      buildSamSearchHref({
        keywords: searchKeywords,
        keywordMode,
        industry: searchIndustry,
        naics: searchNaics,
        agency: searchAgency,
        state: searchState,
        status: searchStatus,
        sort: sortBy,
        browse: browseAll,
        setAside: searchSetAside,
        valueBand: searchValueBand,
      }),
    [
      browseAll,
      keywordMode,
      searchAgency,
      searchIndustry,
      searchKeywords,
        searchNaics,
        searchSetAside,
        searchState,
        searchStatus,
        searchValueBand,
        sortBy,
      ],
    );
  const directSamSearchUrl = useMemo(
    () =>
      buildDirectSamSearchUrl({
        keywords: searchKeywords || searchIndustry,
        agency: searchAgency,
        state: searchState,
        naics: searchNaics,
      }),
    [searchAgency, searchIndustry, searchKeywords, searchNaics, searchState],
  );

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
              searchSetAside,
              searchValueBand,
            ),
          ),
          sortBy,
        ),
      [appliedKeywordTerms, keywordMode, records, searchAgency, searchNaics, searchSetAside, searchState, searchStatus, searchValueBand, sortBy],
    );
  const resultsPageSize = 20;
  const resultsTotalPages = Math.max(1, Math.ceil(filteredResults.length / resultsPageSize));
  const currentResultsPage = Math.min(resultsPage, resultsTotalPages);
  const visibleResults = filteredResults.slice(
    (currentResultsPage - 1) * resultsPageSize,
    currentResultsPage * resultsPageSize,
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
      browse: boolean;
      setAside: SamSetAsideFilter;
      valueBand: SamContractValueBand;
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
        browse: next?.browse ?? browseAll,
        setAside: next?.setAside ?? searchSetAside,
        valueBand: next?.valueBand ?? searchValueBand,
      });

    startTransition(() => {
      router.push(href);
    });
  };

  const hasActiveFilters =
    !!searchKeywords.trim() ||
    !!searchIndustry.trim() ||
    !!searchNaics.trim() ||
    !!searchAgency.trim() ||
    !!searchState.trim() ||
    searchSetAside !== "all" ||
    searchValueBand !== "all" ||
    searchStatus !== "all";

  const clearAll = () => {
    setSearchKeywords("");
    setSearchIndustry("");
    setSearchNaics("");
    setSearchAgency("");
    setSearchState("");
    setSearchStatus("all");
    setSearchSetAside("all");
    setSearchValueBand("all");
    setSortBy("due-soon");
    setBrowseAll(false);
    applySearch({
      keywords: "", industry: "", naics: "", agency: "", state: "",
      status: "all", keywordMode: "all", setAside: "all", valueBand: "all",
      sort: "due-soon", browse: false,
    });
  };

  return (
    <div className="space-y-5">

      {/* ── SEARCH BAR + FILTERS ── */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setBrowseAll(true);
          applySearch();
        }}
        className="space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur sm:p-6"
      >
        {/* Primary search input */}
        <div className="flex gap-2">
          <input
            name="keywords"
            value={searchKeywords}
            onChange={(event) => { setSearchKeywords(event.target.value); setBrowseAll(true); }}
            placeholder="Search contracts — pest control, roofing, IT support…"
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          />
          <button type="submit" className={buttonStyles({ variant: "primary", size: "md" })}>
            {isNavigating ? "…" : "Search"}
          </button>
        </div>

        {/* Filter row — dropdowns + quick actions */}
        <div className="flex flex-wrap gap-2">
          {/* Set-aside */}
          <select
            value={searchSetAside}
            onChange={(event) => { setSearchSetAside(event.target.value as SamSetAsideFilter); setBrowseAll(true); }}
            className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
          >
            <option value="all">All set-asides</option>
            <option value="small-business">Small business</option>
            <option value="veteran">Veteran only</option>
            <option value="women-owned">Women-owned</option>
            <option value="8a">8(a)</option>
            <option value="hubzone">HUBZone</option>
          </select>

          {/* Contract size */}
          <select
            value={searchValueBand}
            onChange={(event) => { setSearchValueBand(event.target.value as SamContractValueBand); setBrowseAll(true); }}
            className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
          >
            <option value="all">All sizes</option>
            <option value="under-250k">Under $250k</option>
            <option value="under-1m">Under $1M</option>
            <option value="1m-10m">$1M – $10M</option>
            <option value="over-10m">Over $10M</option>
          </select>

          {/* Status */}
          <select
            value={searchStatus}
            onChange={(event) => { setSearchStatus(event.target.value as SearchSamStatus); setBrowseAll(true); }}
            className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
          >
            <option value="all">All statuses</option>
            <option value="available">Available now</option>
            <option value="closing-soon">Closing soon</option>
            <option value="needs-review">Needs review</option>
          </select>

          {/* State */}
          <input
            name="state"
            value={searchState}
            onChange={(event) => { setSearchState(event.target.value); setBrowseAll(true); }}
            placeholder="State (WA, TX…)"
            className="w-32 rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
          />

          {/* Browse all */}
          <button
            type="button"
            onClick={() => {
              setSearchKeywords(""); setSearchIndustry(""); setSearchNaics("");
              setSearchAgency(""); setSearchState(""); setSearchStatus("available");
              setSearchSetAside("all"); setSearchValueBand("all");
              setSortBy("due-soon"); setBrowseAll(true); setErrorMessage("");
              applySearch({ keywords: "", industry: "", naics: "", agency: "",
                state: "", status: "available", keywordMode: "all",
                setAside: "all", valueBand: "all", sort: "due-soon", browse: true });
            }}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            Browse all
          </button>

          {/* Clear — only when filters are active */}
          {hasActiveFilters ? (
            <button type="button" onClick={clearAll} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              Clear
            </button>
          ) : null}
        </div>

        {/* Advanced filters — collapsed by default */}
        <details className="group rounded-[1.5rem] border border-white/10 bg-slate-950/60">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 marker:hidden">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="3" y1="7" x2="11" y2="7"/><line x1="5" y1="11" x2="9" y2="11"/></svg>
              Advanced filters
              {(searchIndustry || searchNaics || searchAgency) ? (
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-200">active</span>
              ) : null}
            </span>
            <span className="text-emerald-300 transition-transform group-open:rotate-45">+</span>
          </summary>

          <div className="space-y-4 border-t border-white/10 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1.5 text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  Industry / service type
                  <InfoTip>Type what your business does — we&apos;ll suggest NAICS codes.</InfoTip>
                </span>
                <input
                  name="industry"
                  value={searchIndustry}
                  onChange={(event) => { setSearchIndustry(event.target.value); setBrowseAll(true); }}
                  placeholder="e.g. pest control, roofing"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50"
                />
              </label>

              <label className="space-y-1.5 text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  NAICS Code
                  <InfoTip>Industry code used by the government to classify work type.</InfoTip>
                </span>
                <input
                  name="naics"
                  value={searchNaics}
                  onChange={(event) => { setSearchNaics(event.target.value); setBrowseAll(true); }}
                  placeholder="e.g. 561710"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50"
                />
              </label>

              <label className="space-y-1.5 text-sm text-slate-200">
                <span>Government agency</span>
                <input
                  name="agency"
                  value={searchAgency}
                  onChange={(event) => { setSearchAgency(event.target.value); setBrowseAll(true); }}
                  placeholder="e.g. Army Corps"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50"
                />
              </label>
            </div>

            {/* Keyword match mode */}
            <div className="space-y-1.5 text-sm text-slate-200">
              <span>Keyword match</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Match all words" },
                  { value: "any", label: "Match any word" },
                  { value: "exact", label: "Exact phrase" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setKeywordMode(option.value as SamKeywordMode)}
                    className={buttonStyles({ variant: keywordMode === option.value ? "primary" : "ghost", size: "sm" })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry code suggestions */}
            {industryMatches.length > 0 ? (
              <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Recommended NAICS codes</p>
                    <p className="mt-1 text-xs text-emerald-100/90">Based on &quot;{searchIndustry}&quot;</p>
                  </div>
                  <button type="button" onClick={() => setSearchNaics(recommendedNaicsCodes.join(", "))} className={buttonStyles({ variant: "primary", size: "sm" })}>
                    Use all
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {industryMatches.map((recommendation) => (
                    <div key={recommendation.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm font-semibold text-white">{recommendation.industry}</p>
                      <p className="mt-1 text-xs text-emerald-200">{recommendation.category}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendation.codes.map((code) => (
                          <button
                            key={`${recommendation.id}-${code.naicsCode}`}
                            type="button"
                            onClick={() => {
                              const nextCodes = Array.from(new Set([...parseMultiValue(searchNaics), code.naicsCode]));
                              setSearchNaics(nextCodes.join(", "));
                            }}
                            className={buttonStyles({ variant: "secondary", size: "sm" })}
                          >
                            {code.naicsCode} — use
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 space-y-1.5 text-sm text-slate-200">
                      <span>Save as code list</span>
                      <input
                        value={newListName}
                        onChange={(event) => setNewListName(event.target.value)}
                        placeholder="List name…"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => { saveNaicsCodeList(newListName || `${searchIndustry || "My"} codes`, recommendedNaicsCodes); setNewListName(""); }}
                      className={buttonStyles({ variant: "primary", size: "md" })}
                    >
                      Save list
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Saved code lists */}
            {savedCodeLists.length > 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Saved code lists</p>
                <div className="mt-3 space-y-3">
                  {savedCodeLists.map((list) => (
                    <div key={list.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-white">{list.name}</p>
                          <p className="mt-1 text-xs text-slate-400">Codes: {(list.samCodes?.length ? list.samCodes : list.codes).join(", ")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const samCodes = list.samCodes?.length ? list.samCodes : list.codes;
                              const keywords = list.searchTerms?.length ? list.searchTerms.slice(0, 4).join(", ") : searchKeywords;
                              setSearchNaics(samCodes.join(", "));
                              if (list.searchTerms?.length && !searchKeywords.trim()) setSearchKeywords(keywords);
                              applySearch({ naics: samCodes.join(", "), keywords, setAside: searchSetAside, valueBand: searchValueBand });
                            }}
                            className={buttonStyles({ variant: "secondary", size: "sm" })}
                          >Apply</button>
                          <button type="button" onClick={() => void removeNaicsCodeList(list.id)} className={buttonStyles({ variant: "ghost", size: "sm" })}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </details>

        {/* Status / error banners */}
        {statusMessage ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <span>{statusMessage}</span>
            <Link href="/sam-search" className={buttonStyles({ variant: "ghost", size: "sm" })}>Refresh page</Link>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{errorMessage}</span>
              <a href={directSamSearchUrl} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "ghost", size: "sm" })}>Open on SAM.gov</a>
            </div>
          </div>
        ) : null}
      </form>

      {/* ── RESULTS ── */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
        {/* Results header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-100">
              {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}
            </span>
            {records.length > 0 ? (
              <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                {records.length} loaded
              </span>
            ) : null}
            {searchSetAside !== "all" ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                {setAsideTabs.find((t) => t.value === searchSetAside)?.label}
              </span>
            ) : null}
            {searchValueBand !== "all" ? (
              <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                {contractValueTabs.find((t) => t.value === searchValueBand)?.label}
              </span>
            ) : null}
            {appliedNaicsCodes.length > 0 ? (
              <span className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                NAICS: {appliedNaicsCodes.join(", ")}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => { const s = event.target.value as SearchSamSort; setSortBy(s); applySearch({ sort: s }); }}
              className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
            >
              <option value="due-soon">Due soonest</option>
              <option value="newest">Newest posted</option>
              <option value="agency">Agency A–Z</option>
              <option value="title">Title A–Z</option>
            </select>
            <button
              type="button"
              onClick={() => {
                void forceRefreshGovernmentData({ keywords: searchKeywords, keywordMode, industry: searchIndustry, naics: searchNaics, agency: searchAgency, state: searchState, status: searchStatus, setAside: searchSetAside, valueBand: searchValueBand, sort: sortBy, browse: browseAll })
                  .then((snapshot) => {
                    setRecords(snapshot.records); setSources(snapshot.sources); setActivities(snapshot.activities);
                    setLastForcedRefreshAt(snapshot.activities[0]?.ranAt);
                    setErrorMessage(snapshot.errorMessage ?? ""); setIsLiveConfigured(snapshot.liveConfigured);
                    setStatusMessage(snapshot.errorMessage ? "SAM refresh finished with a warning." : "Live SAM records refreshed.");
                  })
                  .catch(() => setErrorMessage("We could not refresh live SAM records right now."));
              }}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Refresh SAM
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {!browseAll && !searchKeywords.trim() && !searchIndustry.trim() && !searchNaics.trim() && !searchAgency.trim() && !searchState.trim() ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm leading-6 text-slate-400">
              Type what your business does above, or tap <span className="font-medium text-white">Browse all</span> to load live SAM results.
            </div>
          ) : null}

          {browseAll && records.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
              <div className="space-y-3">
                <p>{isLiveConfigured ? "No live SAM opportunities returned right now. Try refreshing, broadening filters, or searching directly on SAM.gov." : "Search SAM needs a live SAM.gov API key to load real opportunities."}</p>
                {isLiveConfigured ? (
                  <a href={directSamSearchUrl} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "secondary", size: "sm" })}>Open on SAM.gov</a>
                ) : null}
              </div>
            </div>
          ) : null}

          {visibleResults.map((result) => (
            <Link
              key={result.id}
              href={buildSamDetailHref(result, currentSearchHref)}
              scroll={false}
              className="block rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-white sm:text-lg">{result.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{result.agency} / {result.location}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${availabilityBadgeClass(result.availabilityStatus)}`}>
                  {result.availabilityStatus}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                <div><p className="text-slate-500">Type</p><p className="mt-0.5 text-white">{result.opportunityType}</p></div>
                <div><p className="text-slate-500">NAICS</p><p className="mt-0.5 text-white">{result.naicsCode}</p></div>
                <div><p className="text-slate-500">Due</p><p className="mt-0.5 text-white">{result.responseDeadline}</p></div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {result.setAside && result.setAside !== "Not listed" ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-100">{result.setAside}</span>
                ) : null}
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-slate-200">Est. {result.estimatedValueLabel}</span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{result.synopsis}</p>
              <p className="mt-3 text-sm font-medium text-emerald-300">View details →</p>
            </Link>
          ))}

          {hasActiveFilters && records.length > 0 && filteredResults.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
              No results for these filters. Try broader terms or tap <span className="font-medium text-white">Clear</span> to reset.
            </div>
          ) : null}

          {filteredResults.length > resultsPageSize ? (
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-300">Page {currentResultsPage} of {resultsTotalPages}</span>
              <div className="flex gap-3">
                <button type="button" disabled={currentResultsPage <= 1} onClick={() => setResultsPage((c) => Math.max(1, c - 1))} className={buttonStyles({ variant: "ghost", size: "sm" })}>← Previous</button>
                <button type="button" disabled={currentResultsPage >= resultsTotalPages} onClick={() => setResultsPage((c) => Math.min(resultsTotalPages, c + 1))} className={buttonStyles({ variant: "secondary", size: "sm" })}>Next →</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Available now</p>
          <p className="mt-3 text-3xl font-semibold text-white">{availableCount}</p>
          <p className="mt-2 text-sm text-slate-400">Tap Browse all to scroll the full active federal list.</p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Connected sources</p>
          <p className="mt-3 text-3xl font-semibold text-white">{sources.filter((s) => s.status === "Connected").length}</p>
          <p className="mt-2 text-sm text-slate-400">Federal sources ready for search.</p>
        </article>
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last refresh</p>
          <p className="mt-3 text-sm font-medium text-emerald-100">{lastForcedRefreshAt ?? activities[0]?.ranAt ?? "Not yet refreshed"}</p>
          <p className="mt-2 text-sm text-slate-400">Use Refresh SAM to pull the latest records.</p>
        </article>
      </section>
    </div>
  );
}
