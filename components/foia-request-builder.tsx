"use client";

import { useMemo, useState } from "react";
import { foiaRequestPlays } from "@/lib/demo-data";

const defaultForm = {
  requesterName: "Demo Capture Team",
  companyName: "The Bid Vault Beta Workspace",
  agencyName: "General Services Administration",
  facilityName: "Downtown Federal Building",
  facilityLocation: "Oakland, CA",
  industry: "Facilities maintenance",
  yearsRequested: "2023-2025",
  recordsRequested:
    "Approved operating budgets, facilities maintenance budgets, incumbent contract modifications, work order summaries, and planning documents related to future service contracts.",
  planningGoal:
    "We are researching prior budget patterns and potential future facilities support opportunities tied to this location.",
  deliveryPreference: "Electronic records by email",
};

export function FoiaRequestBuilder() {
  const [form, setForm] = useState(defaultForm);

  const requestDraft = useMemo(() => {
    return `To ${form.agencyName},

Pursuant to the Freedom of Information Act, I request access to records related to ${form.facilityName} in ${form.facilityLocation}.

Requested time period: ${form.yearsRequested}

Requested records:
${form.recordsRequested}

Purpose of request:
${form.planningGoal}

If possible, please provide these records in electronic form. Preferred delivery method: ${form.deliveryPreference}.

Requester:
${form.requesterName}
${form.companyName}`;
  }, [form]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          FOIA request builder
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Draft a request for prior budgets and facility planning records.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Use this to frame requests for facility operating budgets, contract
          modifications, and planning documents that can help forecast upcoming
          bid size and scope.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["requesterName", "Requester name"],
            ["companyName", "Company"],
            ["agencyName", "Agency"],
            ["facilityName", "Facility"],
            ["facilityLocation", "Location"],
            ["industry", "Industry"],
            ["yearsRequested", "Years requested"],
            ["deliveryPreference", "Delivery preference"],
          ].map(([name, label]) => (
            <label key={name} className="space-y-2 text-sm text-slate-200">
              <span>{label}</span>
              <input
                value={form[name as keyof typeof form]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Requested records</span>
            <textarea
              rows={5}
              value={form.recordsRequested}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recordsRequested: event.target.value,
                }))
              }
              className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>Planning goal</span>
            <textarea
              rows={4}
              value={form.planningGoal}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  planningGoal: event.target.value,
                }))
              }
              className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
            />
          </label>
        </div>
      </article>

      <div className="space-y-6">
        <article className="rounded-[2rem] border border-emerald-400/20 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Request preview
          </p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm leading-7 text-slate-200">
            {requestDraft}
          </pre>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Recommended FOIA plays
          </p>
          <div className="mt-5 space-y-4">
            {foiaRequestPlays.map((play) => (
              <section
                key={play.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"
              >
                <h3 className="text-base font-semibold text-white">{play.label}</h3>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Target records
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {play.targetRecords.map((record) => (
                    <span
                      key={record}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
                    >
                      {record}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Budget signals to watch
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {play.budgetSignals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                    >
                      {signal}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">{play.timingTip}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
