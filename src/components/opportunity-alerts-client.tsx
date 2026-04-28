"use client";

import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import {
  readSavedAlertRules,
  removeAlertRule,
  saveAlertRule,
  type AlertChannel,
  type AlertFrequency,
  type AlertScope,
  type SavedAlertRule,
} from "@/lib/demo-alert-store";
import type { StateDirectoryEntry } from "@/lib/sources/state-registry";

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function OpportunityAlertsClient({
  states,
}: {
  states: StateDirectoryEntry[];
}) {
  const [industry, setIndustry] = useState("");
  const [stateCode, setStateCode] = useState("WA");
  const [countiesOrCities, setCountiesOrCities] = useState("");
  const [keywords, setKeywords] = useState("");
  const [categoryCodes, setCategoryCodes] = useState("");
  const [channels, setChannels] = useState<AlertChannel[]>(["email"]);
  const [scopes, setScopes] = useState<AlertScope[]>(["sam", "state-local"]);
  const [frequency, setFrequency] = useState<AlertFrequency>("daily");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedRules, setSavedRules] = useState<SavedAlertRule[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const sync = () => setSavedRules(readSavedAlertRules());
    sync();
    window.addEventListener("bid-vault-alert-rules-updated", sync);
    return () => window.removeEventListener("bid-vault-alert-rules-updated", sync);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
          Contract alert setup
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Tell us what work you do and where you want new contract alerts.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Save your industry, state, and delivery preference so we can prepare alerts for new
          federal and local opportunities. This keeps the app focused on the work you actually
          want instead of making you re-run the same searches every day.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Industry or service type</span>
              <input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="Example: pest control, roofing, plumbing"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">State</span>
              <select
                value={stateCode}
                onChange={(event) => setStateCode(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              >
                {states.map((state) => (
                  <option key={state.stateCode} value={state.stateCode} className="bg-slate-950">
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">County or city area</span>
              <input
                value={countiesOrCities}
                onChange={(event) => setCountiesOrCities(event.target.value)}
                placeholder="Optional: Mecklenburg County, Phoenix, Nye County"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Extra search words</span>
              <input
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="Optional: bird exclusion, rodent control, fencing"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white">Saved work category or service codes</span>
              <input
                value={categoryCodes}
                onChange={(event) => setCategoryCodes(event.target.value)}
                placeholder="Optional: comma-separated codes"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white">Where should we look?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  ["sam", "Federal contracts (SAM.gov)"],
                  ["state-local", "State and local contracts"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScopes((current) => toggleValue(current, value))}
                    className={buttonStyles({
                      variant: scopes.includes(value) ? "primary" : "ghost",
                      size: "sm",
                    })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white">How should we contact you?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  ["email", "Email"],
                  ["sms", "Text message"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setChannels((current) => toggleValue(current, value))}
                    className={buttonStyles({
                      variant: channels.includes(value) ? "primary" : "ghost",
                      size: "sm",
                    })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Email address</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Phone for text alerts</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(555) 555-5555"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Alert timing</span>
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as AlertFrequency)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="as-soon-as-found" className="bg-slate-950">As soon as found</option>
                <option value="daily" className="bg-slate-950">Daily summary</option>
                <option value="weekly" className="bg-slate-950">Weekly summary</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!industry.trim()) {
                  setStatus("Add the type of work your business does first.");
                  return;
                }

                if (channels.includes("email") && !email.trim()) {
                  setStatus("Add an email address if you want email alerts.");
                  return;
                }

                if (channels.includes("sms") && !phone.trim()) {
                  setStatus("Add a phone number if you want text alerts.");
                  return;
                }

                saveAlertRule({
                  industry: industry.trim(),
                  stateCode,
                  countiesOrCities: countiesOrCities.trim(),
                  keywords: keywords.trim(),
                  categoryCodes: categoryCodes
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                  channels,
                  scopes,
                  frequency,
                  email: email.trim(),
                  phone: phone.trim(),
                });

                setStatus("Alert rule saved. This workspace is now ready for matching and future delivery.");
              }}
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              Save alert rule
            </button>
            <p className="self-center text-sm text-slate-400">
              {status || "Start with one rule and we can expand from there."}
            </p>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
              How this will work
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>We save the industry, state, and local area you care about.</li>
              <li>We use that rule to match new SAM and state or local opportunities.</li>
              <li>Delivery by email and text is provider-ready once SendGrid or Twilio style keys are added.</li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
              Saved alert rules
            </p>
            {savedRules.length ? (
              <div className="mt-4 space-y-3">
                {savedRules.map((rule) => (
                  <div key={rule.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-base font-semibold text-white">{rule.industry}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {rule.stateCode}
                      {rule.countiesOrCities ? ` / ${rule.countiesOrCities}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {rule.scopes.join(" + ")} / {rule.channels.join(" + ")} / {rule.frequency}
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => removeAlertRule(rule.id)}
                        className={buttonStyles({ variant: "ghost", size: "sm" })}
                      >
                        Remove rule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                No alert rules yet. Add one for your state and industry so the app is ready to notify you when matching contracts appear.
              </p>
            )}
          </article>
        </aside>
      </section>
    </div>
  );
}
