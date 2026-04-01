"use client";

import {
  demoContracts,
  demoTenants,
  type DataSourceCoverage,
  type DemoContract,
  type ExtractedContractRecord,
  type SyncActivity,
} from "@/lib/demo-data";

const CONTRACTS_KEY = "bid-vault-demo-contracts";
const PLANNING_KEY = "bid-vault-demo-planning";

export type DemoContractDraft = Omit<
  DemoContract,
  | "id"
  | "tenantId"
  | "incumbentCompany"
  | "predictedRebidDate"
  | "confidenceScore"
  | "keyTerms"
  | "stage"
>;

type SamSnapshot = {
  records: ExtractedContractRecord[];
  sources: DataSourceCoverage[];
  activities: SyncActivity[];
  liveConfigured: boolean;
  errorMessage?: string;
};

async function fetchSamSnapshot(): Promise<SamSnapshot> {
  const response = await fetch("/api/sam-search/snapshot", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load live SAM records.");
  }

  return (await response.json()) as SamSnapshot;
}

export function readDemoContracts() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CONTRACTS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as DemoContract[];
  } catch {
    return [];
  }
}

export function writeDemoContract(draft: DemoContractDraft) {
  const existing = readDemoContracts();
  const contract: DemoContract = {
    id: `demo-contract-${Date.now()}`,
    tenantId: demoTenants[0].id,
    title: draft.title,
    agency: draft.agency,
    naicsCode: draft.naicsCode,
    state: draft.state,
    location: draft.location,
    summary: draft.summary,
    awardAmount: draft.awardAmount,
    awardDate: draft.awardDate,
    expirationDate: draft.expirationDate,
    stage: "Watch",
    incumbentCompany: "New opportunity",
    predictedRebidDate: draft.expirationDate,
    confidenceScore: 0.6,
    keyTerms: [draft.title, draft.agency, draft.naicsCode, draft.state].map((item) =>
      item.toLowerCase(),
    ),
  };

  const next = [contract, ...existing];
  window.localStorage.setItem(CONTRACTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-contracts-updated"));
}

export function getMergedDemoContracts() {
  return [...readDemoContracts(), ...demoContracts];
}

export async function getMergedGovData() {
  const snapshot = await fetchSamSnapshot();
  return {
    documents: [],
    records: snapshot.records,
  };
}

export async function getMergedSyncState() {
  const snapshot = await fetchSamSnapshot();
  return {
    sources: snapshot.sources,
    activities: snapshot.activities,
    lastForcedRefreshAt: snapshot.activities[0]?.ranAt,
    errorMessage: snapshot.errorMessage,
    liveConfigured: snapshot.liveConfigured,
  };
}

export async function forceRefreshGovernmentData() {
  const snapshot = await fetchSamSnapshot();
  window.dispatchEvent(new CustomEvent("bid-vault-gov-data-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-sync-updated"));
  return snapshot;
}

export function resetDemoState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONTRACTS_KEY);
  window.localStorage.removeItem(PLANNING_KEY);
  window.dispatchEvent(new CustomEvent("bid-vault-contracts-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-planning-updated"));
}

