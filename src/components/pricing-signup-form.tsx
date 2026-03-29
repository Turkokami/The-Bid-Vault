"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ServiceTier } from "@/lib/demo-data";

export function PricingSignupForm({
  tiers,
  defaultTierId,
}: {
  tiers: ServiceTier[];
  defaultTierId?: string;
}) {
  const [selectedTierId, setSelectedTierId] = useState(defaultTierId ?? tiers[0]?.id ?? "");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const selectedTier = tiers.find((tier) => tier.id === selectedTierId) ?? tiers[0];

  return (
    <section
      id="signup"
      className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Start a subscription</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Choose a plan and request your workspace</h2>
      <p className="mt-2 text-sm leading-7 text-emerald-50/90">
        Pick the plan that fits your team. This signup step helps us get your workspace and onboarding started.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-100">
          <span>Choose your plan</span>
          <select
            value={selectedTierId}
            onChange={(event) => setSelectedTierId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
          >
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} / {tier.priceLabel}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-100">
          <span>Business name</span>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Example: Northwest Pest & Exclusion"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
      </div>

      <label className="mt-4 block space-y-2 text-sm text-slate-100">
        <span>Work email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
        />
      </label>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-slate-100">
        <p className="font-medium text-white">{selectedTier?.name}</p>
        <p className="mt-1 text-emerald-200">{selectedTier?.priceLabel}</p>
        <p className="mt-3 leading-6 text-slate-300">{selectedTier?.description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setMessage(
              `Thanks${companyName ? `, ${companyName}` : ""}. Your ${selectedTier?.name ?? "selected"} subscription request is ready for onboarding.`,
            );
          }}
        >
          Start subscription
        </Button>
        <a
          href={`mailto:sales@thebidvault.app?subject=${encodeURIComponent(
            `The Bid Vault ${selectedTier?.name ?? "Plan"} signup`,
          )}&body=${encodeURIComponent(
            `Business name: ${companyName || "[add your business name]"}\nEmail: ${email || "[add your email]"}\nSelected plan: ${selectedTier?.name ?? ""}`,
          )}`}
          className="inline-flex"
        >
          <Button variant="ghost" size="md" type="button">
            Email sales instead
          </Button>
        </a>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-50">{message}</p> : null}
    </section>
  );
}
