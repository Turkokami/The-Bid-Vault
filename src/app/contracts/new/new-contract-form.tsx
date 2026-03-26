"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useActionState } from "react";
import {
  createContract,
  initialCreateContractState,
} from "@/app/contracts/new/actions";
import { writeDemoContract } from "@/lib/demo-contract-store";

const fields = [
  { name: "title", label: "Contract title", type: "text", placeholder: "Regional HVAC Preventive Maintenance" },
  { name: "agency", label: "Agency", type: "text", placeholder: "U.S. Army Corps of Engineers" },
  { name: "naicsCode", label: "NAICS code", type: "text", placeholder: "238220" },
  { name: "state", label: "State", type: "text", placeholder: "CA" },
  { name: "location", label: "Location", type: "text", placeholder: "Sacramento, CA" },
  { name: "awardAmount", label: "Award amount", type: "number", placeholder: "684000" },
  { name: "awardDate", label: "Award date", type: "date", placeholder: "" },
  { name: "expirationDate", label: "Expiration date", type: "date", placeholder: "" },
];

export function NewContractForm() {
  const [state, formAction, pending] = useActionState(
    createContract,
    initialCreateContractState,
  );

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    if (state.mode !== "demo") {
      return;
    }

    const form = document.querySelector<HTMLFormElement>("form[data-contract-form='new']");

    if (!form) {
      return;
    }

    const formData = new FormData(form);

    writeDemoContract({
      title: String(formData.get("title") ?? ""),
      agency: String(formData.get("agency") ?? ""),
      naicsCode: String(formData.get("naicsCode") ?? ""),
      state: String(formData.get("state") ?? ""),
      location: String(formData.get("location") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      awardAmount: Number(formData.get("awardAmount") ?? 0),
      awardDate: String(formData.get("awardDate") ?? ""),
      expirationDate: String(formData.get("expirationDate") ?? ""),
    });
  }, [state.mode, state.status]);

  return (
    <form action={formAction} className="space-y-6" data-contract-form="new">
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2 text-sm text-slate-200">
            <span>{field.label}</span>
            <input
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            />
            {state.fieldErrors?.[field.name]?.map((error) => (
              <p key={error} className="text-xs text-rose-300">
                {error}
              </p>
            ))}
          </label>
        ))}
      </div>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Summary</span>
        <textarea
          name="summary"
          rows={6}
          placeholder="Describe the scope, service delivery expectations, and contract lifecycle details."
          className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        />
        {state.fieldErrors?.summary?.map((error) => (
          <p key={error} className="text-xs text-rose-300">
            {error}
          </p>
        ))}
      </label>

      {state.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-400/10 text-rose-100"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="flex flex-wrap gap-3">
          {state.contractId ? (
            <Link
              href={`/contracts/${state.contractId}`}
              className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100"
            >
              Open contract
            </Link>
          ) : null}
          <Link
            href="/contracts"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300"
          >
            View contracts
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300"
          >
            Open dashboard
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Saving contract..." : "Create contract"}
      </button>
    </form>
  );
}
