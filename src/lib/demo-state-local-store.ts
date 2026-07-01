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

async function fetchStateLocalSnapshot(forceRefresh = false): Promise<StateLocalSnapshot> {
  const response = await fetch(`/api/state-local/snapshot${forceRefresh ? "?refresh=1" : ""}`, {
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

// --- localStorage fallback (used when not authenticated) ---

function readLocalSaved(): SavedStateLocalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STATE_LOCAL_SAVED_KEY) ?? "[]") as SavedStateLocalEntry[];
  } catch {
    return [];
  }
}

function writeLocalSaved(entries: SavedStateLocalEntry[]) {
  window.localStorage.setItem(STATE_LOCAL_SAVED_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-saved-updated"));
}

export function readSavedStateLocalEntries(): SavedStateLocalEntry[] {
  return readLocalSaved();
}

// --- DB-backed API calls (fall back to localStorage on error / unauthed) ---

export async function saveStateLocalOpportunity(input: {
  opportunity: NormalizedStateLocalOpportunity;
  reminderDaysBefore?: number;
  notes?: string;
}) {
  try {
    const res = await fetch("/api/state-local/saves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunity: input.opportunity,
        notes: input.notes ?? "Saved from the results page for follow-up review.",
        reminderDaysBefore: input.reminderDaysBefore ?? 14,
      }),
    });

    if (res.ok) {
      // Mirror to localStorage so the UI updates immediately without a round-trip
      const current = readLocalSaved().filter((e) => e.opportunityId !== input.opportunity.id);
      writeLocalSaved([
        { opportunityId: input.opportunity.id, reminderDaysBefore: input.reminderDaysBefore ?? 14, notes: input.notes ?? "", createdAt: new Date().toISOString() },
        ...current,
      ]);
      return;
    }
  } catch {
    // fall through to localStorage
  }

  // Not authenticated or API error — save locally only
  const current = readLocalSaved().filter((e) => e.opportunityId !== input.opportunity.id);
  writeLocalSaved([
    { opportunityId: input.opportunity.id, reminderDaysBefore: input.reminderDaysBefore ?? 14, notes: input.notes ?? "", createdAt: new Date().toISOString() },
    ...current,
  ]);
}

export async function removeSavedStateLocalOpportunity(opportunityId: string) {
  try {
    await fetch(`/api/state-local/saves?id=${encodeURIComponent(opportunityId)}`, { method: "DELETE" });
  } catch {
    // fall through
  }
  const current = readLocalSaved().filter((e) => e.opportunityId !== opportunityId);
  writeLocalSaved(current);
}

export async function syncSavedIdsFromDb(): Promise<string[]> {
  try {
    const res = await fetch("/api/state-local/saves");
    if (!res.ok) return readLocalSaved().map((e) => e.opportunityId);
    const data = await res.json() as { ids: string[] };
    // Sync DB ids into localStorage so offline reads stay accurate
    const local = readLocalSaved();
    const merged = [...new Set([...data.ids, ...local.map((e) => e.opportunityId)])];
    // Only keep local entries; DB-only ids don't have full metadata locally but that's fine
    return merged;
  } catch {
    return readLocalSaved().map((e) => e.opportunityId);
  }
}

export async function forceRefreshStateLocalSource() {
  await fetchStateLocalSnapshot(true);
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-updated"));
}
