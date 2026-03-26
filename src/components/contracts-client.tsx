"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  industryRecommendations,
  keywordTrackingGroups,
  type IndustryRecommendation,
  type DemoContract,
  type DemoTenant,
} from "@/lib/demo-data";
import { getMergedDemoContracts } from "@/lib/demo-contract-store";
import { formatCurrency, formatPercent } from "@/lib/format";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseMultiValue(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function filterLocalContracts(
  contracts: DemoContract[],
  keywords: string[],
  naics?: string,
  agency?: string,
  state?: string,
) {
  const naicsCodes = parseMultiValue(naics);

  return contracts.filter((contract) => {
    const matchesNaics = naicsCodes.length > 0 ? naicsCodes.includes(contract.naicsCode) : true;
    const matchesAgency = agency ? contract.agency === agency : true;
    const matchesState = state ? contract.state === state : true;
    const blob = [
      contract.title,
      contract.summary,
      contract.agency,
      contract.location,
      ...contract.keyTerms,
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) => blob.includes(keyword.toLowerCase()));

    return matchesNaics && matchesAgency && matchesState && matchesKeywords;
  });
}

export function ContractsClient({
  initialContracts,
  tenants,
  initialKeywords,
  initialNaics,
  initialAgency,
  initialState,
  initialIndustry,
  mode,
}: {
  initialContracts: DemoContract[];
  tenants: DemoTenant[];
  initialKeywords: string[];
  initialNaics?: string;
  initialAgency?: string;
  initialState?: string;
  initialIndustry?: string;
  mode: "database" | "demo";
}) {
  const [contracts, setContracts] = useState<DemoContract[]>(initialContracts);
  const [searchIndustry, setSearchIndustry] = useState(initialIndustry ?? "");
  const [searchKeywords, setSearchKeywords] = useState(initialKeywords.join(", "));
  const [searchNaics, setSearchNaics] = useState(initialNaics ?? "");
  const [searchAgency, setSearchAgency] = useState(initialAgency ?? "");
  const [searchState, setSearchState] = useState(initialState ?? "");

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => setContracts(getMergedDemoContracts());
    sync();
    window.addEventListener("bid-vault-contracts-updated", sync);
    return () => window.removeEventListener("bid-vault-contracts-updated", sync);
  }, [mode]);

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

  const filteredContracts = useMemo(
    () => filterLocalContracts(contracts, appliedKeywordTerms, searchNaics, searchAgency, searchState),
    [appliedKeywordTerms, contracts, searchAgency, searchNaics, searchState],
  );

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
          action="/contracts"
        >
          <div className="mb-5 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
              Search contracts like a live opportunity board
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-50/90">
              Search by plain-language terms, industry type, recommended NAICS codes, agency, and
              state so you can work more like SAM-style contract discovery without needing the exact
              wording first.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm text-slate-200 xl:col-span-2">
              <span>Multiple key terms</span>
              <input
                name="keywords"
                value={searchKeywords}
                onChange={(event) => setSearchKeywords(event.target.value)}
                placeholder="hvac, federal facilities, maintenance"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 xl:col-span-2">
              <span>Industry or service type</span>
              <input
                name="industry"
                value={searchIndustry}
                onChange={(event) => setSearchIndustry(event.target.value)}
                placeholder="Try: pest control, wildlife exclusion, janitorial"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
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
                    Based on &quot;{searchIndustry}&quot;, here are likely-fit NAICS codes for this contract search.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchNaics(recommendedNaicsCodes.join(", "))}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Apply all codes
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {industryMatches.flatMap((recommendation) =>
                  recommendation.codes.map((code) => (
                    <button
                      key={`${recommendation.id}-${code.naicsCode}`}
                      type="button"
                      onClick={() => {
                        const nextCodes = Array.from(
                          new Set([...parseMultiValue(searchNaics), code.naicsCode]),
                        );
                        setSearchNaics(nextCodes.join(", "));
                      }}
                      className="rounded-full border border-emerald-400/20 bg-slate-950/50 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-400/10"
                    >
                      {code.naicsCode} / {code.title}
                    </button>
                  )),
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Apply filters
            </button>
            <Link
              href="/contracts"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Reset
            </Link>
          </div>
          {searchNaics ? (
            <p className="mt-4 text-xs text-slate-400">Active NAICS filter: {searchNaics}</p>
          ) : null}
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Keyword tracking sets
          </p>
          <div className="mt-5 space-y-4">
            {keywordTrackingGroups.map((group) => (
              <article
                key={group.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">{group.label}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {group.matchCount} matching opportunities
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    {group.reminderWindow}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-emerald-400/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Contract results</p>
            <p className="mt-1 text-sm text-slate-200">
              {filteredContracts.length} matching contracts ready for review
            </p>
          </div>
          <Link
            href="/contracts/new"
            className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/10"
          >
            Add manual contract
          </Link>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr_0.7fr_0.8fr_0.8fr_0.7fr] gap-4 bg-slate-950 px-5 py-4 text-xs uppercase tracking-[0.25em] text-slate-400">
          <span>Contract</span>
          <span>Tenant</span>
          <span>NAICS</span>
          <span>State</span>
          <span>Award</span>
          <span>Confidence</span>
        </div>
        {filteredContracts.map((contract) => {
          const tenant = tenants.find((item) => item.id === contract.tenantId);
          const isDemo = contract.id.startsWith("demo-contract-");

          return (
            <div
              key={contract.id}
              className="grid grid-cols-[1.5fr_1fr_0.7fr_0.8fr_0.8fr_0.7fr] gap-4 border-t border-white/10 bg-white/5 px-5 py-5 text-sm text-slate-200"
            >
              <div>
                {isDemo ? (
                  <span className="font-medium text-white">{contract.title}</span>
                ) : (
                  <Link
                    href={`/contracts/${contract.id}`}
                    className="font-medium text-white hover:text-emerald-200"
                  >
                    {contract.title}
                  </Link>
                )}
                <p className="mt-2 text-xs text-slate-400">{contract.agency}</p>
              </div>
              <span className="text-slate-300">{tenant?.name ?? "Unknown workspace"}</span>
              <span>{contract.naicsCode}</span>
              <span>{contract.state}</span>
              <span>{formatCurrency(contract.awardAmount)}</span>
              <span className="text-emerald-300">
                {formatPercent(contract.confidenceScore)}
              </span>
            </div>
          );
        })}
      </section>
    </>
  );
}
