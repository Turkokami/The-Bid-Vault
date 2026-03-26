"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeywordTrackingGroup } from "@/lib/demo-data";
import {
  buildSavedContractsFromEntries,
  getDefaultPlanningEntries,
  readDemoPlanningEntries,
} from "@/lib/demo-planning-store";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SavedContractPlanView } from "@/lib/server/planning";

export function WatchlistClient({
  initialSavedContracts,
  keywordTrackingGroups,
  mode,
}: {
  initialSavedContracts: SavedContractPlanView[];
  keywordTrackingGroups: KeywordTrackingGroup[];
  mode: "database" | "demo";
}) {
  const [demoSavedContracts, setDemoSavedContracts] =
    useState<SavedContractPlanView[]>(initialSavedContracts);
  const savedContracts = mode === "demo" ? demoSavedContracts : initialSavedContracts;

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => {
      const entries = readDemoPlanningEntries();
      const next = buildSavedContractsFromEntries(entries);
      setDemoSavedContracts(next.length > 0 ? next : initialSavedContracts);
    };

    if (typeof window !== "undefined" && !window.localStorage.getItem("bid-vault-demo-planning")) {
      window.localStorage.setItem(
        "bid-vault-demo-planning",
        JSON.stringify(getDefaultPlanningEntries()),
      );
    }

    sync();
    window.addEventListener("bid-vault-planning-updated", sync);
    return () => window.removeEventListener("bid-vault-planning-updated", sync);
  }, [initialSavedContracts, mode]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        {savedContracts.map((saved) => (
          <article
            key={saved.id}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Link
                  href={`/contracts/${saved.contract.id}`}
                  className="text-lg font-semibold text-white hover:text-emerald-200"
                >
                  {saved.contract.title}
                </Link>
                <p className="mt-2 text-sm text-slate-400">
                  {saved.contract.agency} / {saved.contract.location}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                {saved.contract.stage}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {saved.contract.keyTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
                >
                  {term}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div>
                <p className="text-slate-500">Award</p>
                <p className="mt-1 text-white">
                  {formatCurrency(saved.contract.awardAmount)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Predicted rebid</p>
                <p className="mt-1 text-white">
                  {formatDate(saved.contract.predictedRebidDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Reminder</p>
                <p className="mt-1 text-white">
                  {saved.reminderDaysBefore} days before rebid
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span className="text-slate-500">Planning note:</span> {saved.notes}
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Tracked keyword groups
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
                    {group.matchCount} live matches
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {group.reminderWindow}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.terms.map((term) => (
                  <span
                    key={term}
                    className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
