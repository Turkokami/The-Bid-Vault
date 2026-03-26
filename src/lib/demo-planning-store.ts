"use client";

import { demoContracts, getSavedContractsWithPlans } from "@/lib/demo-data";

const STORAGE_KEY = "bid-vault-demo-planning";

export type DemoPlanningEntry = {
  contractId: string;
  reminderDaysBefore: number;
  ownerLabel: string;
  notes: string;
};

export function getDefaultPlanningEntries(): DemoPlanningEntry[] {
  return getSavedContractsWithPlans().map((saved) => ({
    contractId: saved.contract.id,
    reminderDaysBefore: saved.reminderDaysBefore,
    ownerLabel: saved.ownerLabel,
    notes: saved.notes,
  }));
}

export function readDemoPlanningEntries() {
  if (typeof window === "undefined") {
    return getDefaultPlanningEntries();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const defaults = getDefaultPlanningEntries();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    return JSON.parse(raw) as DemoPlanningEntry[];
  } catch {
    const defaults = getDefaultPlanningEntries();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

export function writeDemoPlanningEntry(entry: DemoPlanningEntry) {
  const existing = readDemoPlanningEntries();
  const next = [
    ...existing.filter((item) => item.contractId !== entry.contractId),
    entry,
  ];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-planning-updated"));
}

export function buildSavedContractsFromEntries(entries: DemoPlanningEntry[]) {
  return entries
    .map((entry, index) => {
      const contract = demoContracts.find((item) => item.id === entry.contractId);

      if (!contract) {
        return null;
      }

      return {
        id: `demo-${index}-${entry.contractId}`,
        contractId: contract.id,
        reminderDaysBefore: entry.reminderDaysBefore,
        ownerLabel: entry.ownerLabel,
        notes: entry.notes,
        contract,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
