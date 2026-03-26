"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildPlanningCalendarEvents } from "@/lib/demo-data";
import {
  buildSavedContractsFromEntries,
  getDefaultPlanningEntries,
  readDemoPlanningEntries,
} from "@/lib/demo-planning-store";
import { formatDate } from "@/lib/format";
import type {
  PlanningCalendarEventView,
  SavedContractPlanView,
} from "@/lib/server/planning";

export function PlanningCalendarClient({
  initialSavedContracts,
  initialPlanningEvents,
  mode,
}: {
  initialSavedContracts: SavedContractPlanView[];
  initialPlanningEvents: PlanningCalendarEventView[];
  mode: "database" | "demo";
}) {
  const [demoSavedContracts, setDemoSavedContracts] =
    useState<SavedContractPlanView[]>(initialSavedContracts);
  const [demoPlanningEvents, setDemoPlanningEvents] =
    useState<PlanningCalendarEventView[]>(initialPlanningEvents);
  const savedContracts = mode === "demo" ? demoSavedContracts : initialSavedContracts;
  const planningEvents = mode === "demo" ? demoPlanningEvents : initialPlanningEvents;

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => {
      const entries = readDemoPlanningEntries();
      const nextSavedContracts = buildSavedContractsFromEntries(entries);

      if (nextSavedContracts.length > 0) {
        setDemoSavedContracts(nextSavedContracts);
        setDemoPlanningEvents(buildPlanningCalendarEvents(nextSavedContracts));
      } else {
        setDemoSavedContracts(initialSavedContracts);
        setDemoPlanningEvents(initialPlanningEvents);
      }
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
  }, [initialPlanningEvents, initialSavedContracts, mode]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        {savedContracts.map((saved) => (
          <article
            key={saved.id}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
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

            <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <p className="text-slate-500">Predicted rebid</p>
                <p className="mt-1 text-white">
                  {formatDate(saved.contract.predictedRebidDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Current expiration</p>
                <p className="mt-1 text-white">
                  {formatDate(saved.contract.expirationDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Reminder lead time</p>
                <p className="mt-1 text-white">
                  {saved.reminderDaysBefore} days before predicted rebid
                </p>
              </div>
              <div>
                <p className="text-slate-500">Owner</p>
                <p className="mt-1 text-white">{saved.ownerLabel}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {saved.notes}
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Upcoming timeline
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Reminder and bid planning events
        </h2>

        <div className="mt-6 space-y-4">
          {planningEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {event.agency} / {event.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-300">
                    {formatDate(event.eventDate)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {event.eventType}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {event.source}
                </span>
                {event.reminderDaysBefore ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                    {event.reminderDaysBefore}-day reminder
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
