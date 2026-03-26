"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  keywordTrackingGroups,
  type DemoContract,
  type DemoTenant,
} from "@/lib/demo-data";
import { getMergedDemoContracts } from "@/lib/demo-contract-store";
import { formatCurrency, formatPercent } from "@/lib/format";

function filterLocalContracts(
  contracts: DemoContract[],
  keywords: string[],
  naics?: string,
  agency?: string,
  state?: string,
) {
  return contracts.filter((contract) => {
    const matchesNaics = naics ? contract.naicsCode === naics : true;
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
  mode,
}: {
  initialContracts: DemoContract[];
  tenants: DemoTenant[];
  initialKeywords: string[];
  initialNaics?: string;
  initialAgency?: string;
  initialState?: string;
  mode: "database" | "demo";
}) {
  const [contracts, setContracts] = useState<DemoContract[]>(initialContracts);

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => setContracts(getMergedDemoContracts());
    sync();
    window.addEventListener("bid-vault-contracts-updated", sync);
    return () => window.removeEventListener("bid-vault-contracts-updated", sync);
  }, [mode]);

  const filteredContracts = useMemo(
    () =>
      filterLocalContracts(
        contracts,
        initialKeywords,
        initialNaics,
        initialAgency,
        initialState,
      ),
    [contracts, initialAgency, initialKeywords, initialNaics, initialState],
  );

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
          action="/contracts"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Multiple key terms</span>
              <input
                name="keywords"
                defaultValue={initialKeywords.join(", ")}
                placeholder="hvac, federal facilities, maintenance"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>NAICS</span>
              <input
                name="naics"
                defaultValue={initialNaics ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Agency</span>
              <input
                name="agency"
                defaultValue={initialAgency ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>State</span>
              <input
                name="state"
                defaultValue={initialState ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
          </div>

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
