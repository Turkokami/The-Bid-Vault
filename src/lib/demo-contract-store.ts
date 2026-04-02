"use client";

import {
  demoContracts,
  demoTenants,
  type DataSourceCoverage,
  type DemoContract,
  type SyncActivity,
} from "@/lib/demo-data";
import type { SamOpportunityRecord } from "@/lib/server/sam-search";

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
  records: SamOpportunityRecord[];
  sources: DataSourceCoverage[];
  activities: SyncActivity[];
  liveConfigured: boolean;
  errorMessage?: string;
};

type SamSnapshotQuery = {
  keywords?: string;
  keywordMode?: "all" | "any" | "exact";
  industry?: string;
  naics?: string;
  agency?: string;
  state?: string;
  status?: "all" | "available" | "closing-soon" | "needs-review";
  sort?: "due-soon" | "newest" | "agency" | "title";
};

function buildSamSnapshotUrl(query?: SamSnapshotQuery) {
  const params = new URLSearchParams();

  if (query?.keywords) params.set("keywords", query.keywords);
  if (query?.keywordMode) params.set("keywordMode", query.keywordMode);
  if (query?.industry) params.set("industry", query.industry);
  if (query?.naics) params.set("naics", query.naics);
  if (query?.agency) params.set("agency", query.agency);
  if (query?.state) params.set("state", query.state);
  if (query?.status) params.set("status", query.status);
  if (query?.sort) params.set("sort", query.sort);

  const search = params.toString();
  return search ? `/api/sam-search/snapshot?${search}` : "/api/sam-search/snapshot";
}

async function fetchSamSnapshot(query?: SamSnapshotQuery): Promise<SamSnapshot> {
  const response = await fetch(buildSamSnapshotUrl(query), {
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

export async function getMergedGovDataForQuery(query?: SamSnapshotQuery) {
  const snapshot = await fetchSamSnapshot(query);
  return {
    documents: [],
    records: snapshot.records,
  };
}

export async function getMergedSyncState(query?: SamSnapshotQuery) {
  const snapshot = await fetchSamSnapshot(query);
  return {
    sources: snapshot.sources,
    activities: snapshot.activities,
    lastForcedRefreshAt: snapshot.activities[0]?.ranAt,
    errorMessage: snapshot.errorMessage,
    liveConfigured: snapshot.liveConfigured,
  };
}

export async function forceRefreshGovernmentData(query?: SamSnapshotQuery) {
  const snapshot = await fetchSamSnapshot(query);
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
