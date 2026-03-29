"use client";

import {
  getStateLocalSyncSnapshot,
} from "@/lib/sources/sync-state-local";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

const STATE_LOCAL_REFRESH_KEY = "bid-vault-state-local-refresh";
const STATE_LOCAL_SAVED_KEY = "bid-vault-state-local-saved";

type StateLocalRefreshState = {
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sourceOverrides: StateLocalSourceSummary[];
  lastManualRefreshAt?: string;
};

export type SavedStateLocalEntry = {
  opportunityId: string;
  reminderDaysBefore: number;
  notes: string;
  createdAt: string;
};

function readRefreshState(): StateLocalRefreshState {
  if (typeof window === "undefined") {
    return { opportunities: [], syncLogs: [], sourceOverrides: [] };
  }

  const raw = window.localStorage.getItem(STATE_LOCAL_REFRESH_KEY);

  if (!raw) {
    return { opportunities: [], syncLogs: [], sourceOverrides: [] };
  }

  try {
    return JSON.parse(raw) as StateLocalRefreshState;
  } catch {
    return { opportunities: [], syncLogs: [], sourceOverrides: [] };
  }
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

export async function getMergedStateLocalSnapshot() {
  const base = await getStateLocalSyncSnapshot();
  const local = readRefreshState();

  return {
    opportunities: [...local.opportunities, ...base.opportunities],
    syncLogs: [...local.syncLogs, ...base.syncLogs],
    sources: base.sources.map((source) => {
      const override = local.sourceOverrides.find((item) => item.id === source.id);
      return override ?? source;
    }),
    lastManualRefreshAt: local.lastManualRefreshAt,
  };
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
  const base = await getStateLocalSyncSnapshot();
  const current = readRefreshState();
  const timestamp = Date.now();
  const now = new Date(timestamp);
  const displayTime = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const isoDate = now.toISOString().slice(0, 10);

  const newOpportunity: NormalizedStateLocalOpportunity = {
    id: `washington-refresh-${timestamp}`,
    externalId: `WEBS-REFRESH-${timestamp}`,
    sourceName: "WEBS",
    sourceCode: "washington",
    stateCode: "WA",
    title: "Refreshed WEBS Facility Bird Exclusion Services",
    issuingEntity: "Washington State Ferries",
    opportunityType: "Open for Bids",
    status: "Open",
    categoryCode: "910-27",
    postedDate: isoDate,
    dueDate: "2026-04-18",
    summary:
      "Manual refresh found a new Washington State Ferries opportunity for bird exclusion, cleanup, and recurring deterrent support.",
    description:
      "This refreshed WEBS sample includes ferry terminal bird exclusion work, roofline sealing, cleanup, deterrent installation, and inspection reporting.",
    location: "Seattle, WA",
    sourceUrl: `https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-REFRESH-${timestamp}`,
    registrationRequired: true,
    registrationNotes:
      "You may need active WEBS registration before you can submit through the original source system.",
    contactName: "Avery Coleman",
    contactEmail: "avery.coleman@wsdot.wa.gov",
    contactPhone: "(206) 555-0141",
    createdAt: isoDate,
    updatedAt: isoDate,
  };

  const newLog: StateLocalSourceSyncLog = {
    id: `state-local-sync-${timestamp}`,
    sourceName: "WEBS",
    sourceCode: "washington",
    syncStatus: "Success",
    lastRunAt: displayTime,
    recordsAdded: 1,
    recordsUpdated: 1,
    notes: "Manual refresh pulled a fresh Washington WEBS sample opportunity into The Bid Vault.",
  };

  const sourceOverrides = base.sources.map((source) =>
    source.sourceCode === "washington"
      ? {
          ...source,
          lastSyncedAt: displayTime,
        }
      : source,
  );

  const next: StateLocalRefreshState = {
    opportunities: [newOpportunity, ...current.opportunities],
    syncLogs: [newLog, ...current.syncLogs],
    sourceOverrides,
    lastManualRefreshAt: displayTime,
  };

  window.localStorage.setItem(STATE_LOCAL_REFRESH_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-state-local-updated"));
}
