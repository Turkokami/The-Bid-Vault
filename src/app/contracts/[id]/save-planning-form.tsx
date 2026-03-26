"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useActionState } from "react";
import {
  initialSavePlanningState,
  saveContractForPlanning,
} from "@/app/contracts/[id]/actions";
import { writeDemoPlanningEntry } from "@/lib/demo-planning-store";

export function SavePlanningForm({ contractId }: { contractId: string }) {
  const [state, formAction, pending] = useActionState(
    saveContractForPlanning,
    initialSavePlanningState,
  );

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    const form = document.querySelector<HTMLFormElement>(
      `form[data-contract-id="${contractId}"]`,
    );

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    writeDemoPlanningEntry({
      contractId,
      reminderDaysBefore: Number(formData.get("reminderDaysBefore") ?? 30),
      ownerLabel: String(formData.get("ownerLabel") ?? "Capture team"),
      notes: String(formData.get("notes") ?? ""),
    });
  }, [contractId, state.status]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      data-contract-id={contractId}
    >
      <input type="hidden" name="contractId" value={contractId} />

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Reminder lead time</span>
        <select
          name="reminderDaysBefore"
          defaultValue="30"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
        >
          <option value="15">15 days before rebid</option>
          <option value="30">30 days before rebid</option>
          <option value="45">45 days before rebid</option>
          <option value="60">60 days before rebid</option>
        </select>
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Owner label</span>
        <input
          name="ownerLabel"
          defaultValue="Capture team"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Planning notes</span>
        <textarea
          name="notes"
          rows={4}
          placeholder="Add preparation notes for the next bid cycle."
          className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
        />
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
          <Link
            href="/watchlist"
            className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100"
          >
            Open watchlist
          </Link>
          <Link
            href="/calendar"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300"
          >
            Open calendar
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save to planning calendar"}
      </button>
    </form>
  );
}
