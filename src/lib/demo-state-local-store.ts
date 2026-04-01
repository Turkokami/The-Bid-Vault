"use client";

import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

const STATE_LOCAL_SAVED_KEY = "bid-vault-state-local-saved";

export type SavedStateLocalEntry = {
  opportunityId: string;
  reminderDaysBefore: number;
  notes: string;
  createdAt: string;
};

type StateLocalSnapshot = {
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sources: StateLocalSourceSummary[];
};

async function fetchStateLocalSnapshot(): Promise<StateLocalSnapshot> {
  const response = await fetch("/api/state-local/snapshot", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load live state and local opportunities.");
  }

  return (await response.json()) as StateLocalSnapshot;
}

export async function getMergedStateLocalSnapshot() {
  return fetchStateLocalSnapshot();
}

export function readSavedStateLocalEntries(): SavedStateLocalEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STATE_LOCAL_SAVED_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SavedStateLocalEntry[];
  } catch {
    return [];
  }
}

export function saveStateLocalOpportunity(input: {
  opportunityId: string;
  reminderDaysBefore: number;
  notes: string;
}) {
  const current = readSavedStateLocalEntries().filter(
    (entry) => entry.opportunityId !== input.opportunityId,
  );

  const next: SavedStateLocalEntry[] = [
    {
      opportunityId: input.opportunityId,
      reminderDaysBefore: input.reminderDaysBefore,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    },
    ...current,
  ];

  window.localStorage.setItem(STATE_LOCAL_SAVED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-saved-updated"));
}

export function removeSavedStateLocalOpportunity(opportunityId: string) {
  const current = readSavedStateLocalEntries().filter(
    (entry) => entry.opportunityId !== opportunityId,
  );
  window.localStorage.setItem(STATE_LOCAL_SAVED_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-saved-updated"));
}

export async function forceRefreshStateLocalSource() {
  await fetchStateLocalSnapshot();
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-updated"));
}

