import {
  dataSourceCoverage,
  demoContracts,
  demoTenants,
  extractedContractRecords,
  syncActivities,
  uploadedSourceDocuments,
  type DataSourceCoverage,
  type DemoContract,
  type ExtractedContractRecord,
  type SyncActivity,
  type UploadedSourceDocument,
} from "@/lib/demo-data";

const CONTRACTS_KEY = "bid-vault-demo-contracts";
const GOV_DATA_KEY = "bid-vault-demo-gov-data";
const PLANNING_KEY = "bid-vault-demo-planning";
const SYNC_STATE_KEY = "bid-vault-demo-sync-state";

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

type DemoSyncState = {
  sources: DataSourceCoverage[];
  activities: SyncActivity[];
  lastForcedRefreshAt?: string;
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

export function readDemoSyncState(): DemoSyncState {
  if (typeof window === "undefined") {
    return { sources: [], activities: [] };
  }

  const raw = window.localStorage.getItem(SYNC_STATE_KEY);

  if (!raw) {
    return { sources: [], activities: [] };
  }

  try {
    return JSON.parse(raw) as DemoSyncState;
  } catch {
    return { sources: [], activities: [] };
  }
}

export function getMergedSyncState() {
  const local = readDemoSyncState();

  return {
    sources: dataSourceCoverage.map((source) => {
      const override = local.sources.find((item) => item.id === source.id);
      return override ?? source;
    }),
    activities: [...local.activities, ...syncActivities],
    lastForcedRefreshAt: local.lastForcedRefreshAt,
  };
}

export function forceRefreshGovernmentData() {
  const timestamp = Date.now();
  const now = new Date(timestamp);
  const isoDate = now.toISOString().slice(0, 10);
  const displayTime = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const currentGovData = readDemoGovData();
  const currentSyncState = readDemoSyncState();

  const refreshDocument: UploadedSourceDocument = {
    id: `sync-doc-${timestamp}`,
    fileName: `SAM_USASpending_refresh_${timestamp}.csv`,
    sourceAgency: "Automated source refresh",
    uploadedAt: isoDate,
    status: "Processed",
    pageCount: 12,
    extractedContracts: 3,
  };

  const refreshRecords: ExtractedContractRecord[] = [
    {
      id: `sync-record-${timestamp}-1`,
      sourceDocumentId: refreshDocument.id,
      title: "SAM.gov Pest and Wildlife Exclusion Refresh",
      agency: "National Park Service",
      naicsCode: "561710",
      state: "CA",
      location: "San Francisco, CA",
      opportunityType: "Facilities Protection Services",
      synopsis:
        "Daily source refresh detected a federal requirement for pest control, rodent exclusion, and wildlife entry-point sealing across visitor facilities.",
      responseDeadline: "2026-05-18",
      availabilityStatus: "Available",
      keyTerms: ["pest control", "wildlife exclusion", "rodent", "sam.gov"],
    },
    {
      id: `sync-record-${timestamp}-2`,
      sourceDocumentId: refreshDocument.id,
      title: "Bird Deterrent and Roofline Exclusion Program",
      agency: "General Services Administration",
      naicsCode: "238990",
      state: "AZ",
      location: "Phoenix, AZ",
      opportunityType: "Bird Exclusion",
      synopsis:
        "Source sync pulled a new facility protection opportunity covering netting, spike systems, roofline sealing, and recurring deterrent inspections.",
      responseDeadline: "2026-05-26",
      availabilityStatus: "Available",
      keyTerms: ["bird exclusion", "deterrent", "roofline", "federal campus"],
    },
    {
      id: `sync-record-${timestamp}-3`,
      sourceDocumentId: refreshDocument.id,
      title: "VA Campus Integrated Rodent Monitoring",
      agency: "Department of Veterans Affairs",
      naicsCode: "561710",
      state: "NM",
      location: "Albuquerque, NM",
      opportunityType: "Integrated Pest Management",
      synopsis:
        "Weekly enrichment surfaced a VA facilities requirement focused on rodent monitoring, pest response, documentation, and exclusion corrections.",
      responseDeadline: "2026-06-02",
      availabilityStatus: "Closing Soon",
      keyTerms: ["rodent monitoring", "integrated pest management", "va", "exclusion"],
    },
  ];

  const nextGovData = {
    documents: [refreshDocument, ...currentGovData.documents],
    records: [...refreshRecords, ...currentGovData.records],
  };

  const nextSources = dataSourceCoverage.map((source) =>
    source.status === "Connected"
      ? {
          ...source,
          lastSyncedAt: displayTime,
        }
      : source,
  );

  const refreshActivity: SyncActivity = {
    id: `sync-activity-${timestamp}`,
    sourceId: "source-sam-opps",
    sourceName: "SAM.gov Opportunities",
    runLabel: "Client force refresh",
    ranAt: displayTime,
    result: "Success",
    recordsAdded: refreshRecords.length,
    notes: "Manual client refresh pulled fresh sample contracts into the research queue.",
  };

  const nextSyncState: DemoSyncState = {
    sources: nextSources,
    activities: [refreshActivity, ...currentSyncState.activities],
    lastForcedRefreshAt: displayTime,
  };

  window.localStorage.setItem(GOV_DATA_KEY, JSON.stringify(nextGovData));
  window.localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(nextSyncState));
  window.dispatchEvent(new CustomEvent("bid-vault-gov-data-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-sync-updated"));
}

export function resetDemoState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONTRACTS_KEY);
  window.localStorage.removeItem(GOV_DATA_KEY);
  window.localStorage.removeItem(PLANNING_KEY);
  window.localStorage.removeItem(SYNC_STATE_KEY);
  window.dispatchEvent(new CustomEvent("bid-vault-contracts-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-gov-data-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-planning-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-sync-updated"));
}
