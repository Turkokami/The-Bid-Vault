"use client";

import {
  demoContracts,
  demoTenants,
  extractedContractRecords,
  uploadedSourceDocuments,
  type DemoContract,
  type ExtractedContractRecord,
  type UploadedSourceDocument,
} from "@/lib/demo-data";

const CONTRACTS_KEY = "bid-vault-demo-contracts";
const GOV_DATA_KEY = "bid-vault-demo-gov-data";
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
    keyTerms: [
      draft.title,
      draft.agency,
      draft.naicsCode,
      draft.state,
    ].map((item) => item.toLowerCase()),
  };

  const next = [contract, ...existing];
  window.localStorage.setItem(CONTRACTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-contracts-updated"));
}

export function getMergedDemoContracts() {
  return [...readDemoContracts(), ...demoContracts];
}

type DemoGovDataState = {
  documents: UploadedSourceDocument[];
  records: ExtractedContractRecord[];
};

export function readDemoGovData(): DemoGovDataState {
  if (typeof window === "undefined") {
    return { documents: [], records: [] };
  }

  const raw = window.localStorage.getItem(GOV_DATA_KEY);

  if (!raw) {
    return { documents: [], records: [] };
  }

  try {
    return JSON.parse(raw) as DemoGovDataState;
  } catch {
    return { documents: [], records: [] };
  }
}

export function getMergedGovData() {
  const local = readDemoGovData();
  return {
    documents: [...local.documents, ...uploadedSourceDocuments],
    records: [...local.records, ...extractedContractRecords],
  };
}

export function addDemoGovUpload() {
  const current = readDemoGovData();
  const timestamp = Date.now();

  const document: UploadedSourceDocument = {
    id: `demo-doc-${timestamp}`,
    fileName: `Uploaded_Gov_Contracts_${timestamp}.csv`,
    sourceAgency: "Demo Agency Import",
    uploadedAt: new Date().toISOString().slice(0, 10),
    status: "Processed",
    pageCount: 8,
    extractedContracts: 2,
  };

  const records: ExtractedContractRecord[] = [
    {
      id: `demo-record-${timestamp}-1`,
      sourceDocumentId: document.id,
      title: "Demo Facilities Operations Support",
      agency: "Demo Agency Import",
      naicsCode: "561210",
      state: "CA",
      location: "San Diego, CA",
      opportunityType: "Operations Support",
      synopsis:
        "Demo uploaded file added a facilities operations support opportunity for testing upload-driven discovery.",
      responseDeadline: "2026-06-14",
      availabilityStatus: "Available",
      keyTerms: ["facilities", "operations", "support", "maintenance"],
    },
    {
      id: `demo-record-${timestamp}-2`,
      sourceDocumentId: document.id,
      title: "Demo Security Patrol Coverage",
      agency: "Demo Agency Import",
      naicsCode: "561612",
      state: "NV",
      location: "Reno, NV",
      opportunityType: "Guard Services",
      synopsis:
        "Demo upload extracted a patrol and access-control contract to simulate uploaded government data search.",
      responseDeadline: "2026-06-22",
      availabilityStatus: "Needs Review",
      keyTerms: ["security", "patrol", "guard", "access control"],
    },
  ];

  const next = {
    documents: [document, ...current.documents],
    records: [...records, ...current.records],
  };

  window.localStorage.setItem(GOV_DATA_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-gov-data-updated"));
}

export function resetDemoState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONTRACTS_KEY);
  window.localStorage.removeItem(GOV_DATA_KEY);
  window.localStorage.removeItem(PLANNING_KEY);
  window.dispatchEvent(new CustomEvent("bid-vault-contracts-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-gov-data-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-planning-updated"));
}
