"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  readSavedStateLocalEntries,
  removeSavedStateLocalOpportunity,
  saveStateLocalOpportunity,
} from "@/lib/demo-state-local-store";

export function StateLocalSavePanel({ opportunityId }: { opportunityId: string }) {
  const defaultNotes =
    "Review this opportunity before the due date and confirm source-system registration needs.";
  const [draft, setDraft] = useState({
    reminderDaysBefore: "14",
    notes: defaultNotes,
  });
  const [hasEdited, setHasEdited] = useState(false);
  const [message, setMessage] = useState("");
  const [savedEntries, setSavedEntries] = useState(readSavedStateLocalEntries());

  useEffect(() => {
    const sync = () => setSavedEntries(readSavedStateLocalEntries());
    sync();
    window.addEventListener("bid-vault-state-local-saved-updated", sync);
    return () => window.removeEventListener("bid-vault-state-local-saved-updated", sync);
  }, []);

  const existing = useMemo(
    () => savedEntries.find((entry) => entry.opportunityId === opportunityId) ?? null,
    [opportunityId, savedEntries],
  );

  const reminderDaysBefore = hasEdited
    ? draft.reminderDaysBefore
    : existing
      ? String(existing.reminderDaysBefore)
      : "14";

  const notes = hasEdited ? draft.notes : existing?.notes ?? defaultNotes;

  return (
    <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Save and track</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Save this opportunity for later</h3>
      <p className="mt-2 text-sm leading-6 text-emerald-50/90">
        Keep this opportunity on your radar and add a reminder before the due date.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="space-y-2 text-sm text-slate-200">
          <span>Reminder lead time</span>
          <select
            value={reminderDaysBefore}
            onChange={(event) => {
              setHasEdited(true);
              setDraft((current) => ({
                ...current,
                reminderDaysBefore: event.target.value,
              }));
            }}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
          >
            <option value="7">7 days before due date</option>
            <option value="14">14 days before due date</option>
            <option value="30">30 days before due date</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => {
              setHasEdited(true);
              setDraft((current) => ({
                ...current,
                notes: event.target.value,
              }));
            }}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            saveStateLocalOpportunity({
              opportunityId,
              reminderDaysBefore: Number(reminderDaysBefore),
              notes,
            });
            setHasEdited(false);
            setDraft({
              reminderDaysBefore,
              notes,
            });
            setMessage("Saved. This opportunity will stay on your watchlist with your reminder note.");
          }}
        >
          Save this opportunity
        </Button>

        {existing ? (
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              removeSavedStateLocalOpportunity(opportunityId);
              setHasEdited(false);
              setDraft({
                reminderDaysBefore: "14",
                notes: defaultNotes,
              });
              setMessage("Removed from your saved state and local opportunities.");
            }}
          >
            Remove saved item
          </Button>
        ) : null}
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-100">{message}</p> : null}
    </div>
  );
}
