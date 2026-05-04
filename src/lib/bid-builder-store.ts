"use client";

export type BidDraftRecord = {
  id: string;
  title: string;
  noticeId?: string;
  agency?: string;
  sourceName?: string;
  dueDate?: string;
  naicsCode?: string;
  setAside?: string;
  summary?: string;
  sourceUrl?: string;
  attachmentsUrl?: string;
  workspaceName: string;
  winThemes: string;
  complianceNotes: string;
  pricingApproach: string;
  questionsForAgency: string;
  submissionChecklist: string;
  teammateAssignments: string;
  aiReviewPoints?: string;
  reviewRequirements?: BidRequirementItem[];
  updatedAt: string;
};

export type BidRequirementStatus = "needs-response" | "addressed" | "blocked";

export type BidRequirementItem = {
  id: string;
  title: string;
  detail: string;
  category: "critical" | "submission" | "compliance" | "pricing" | "evaluation";
  status: BidRequirementStatus;
};

const BID_DRAFTS_KEY = "bid-vault-bid-drafts";

function isClient() {
  return typeof window !== "undefined";
}

export function readBidDrafts() {
  if (!isClient()) {
    return [] as BidDraftRecord[];
  }

  const raw = window.localStorage.getItem(BID_DRAFTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as BidDraftRecord[];
  } catch {
    return [];
  }
}

export function readBidDraft(id: string) {
  return readBidDrafts().find((draft) => draft.id === id) ?? null;
}

export function saveBidDraft(draft: BidDraftRecord) {
  if (!isClient()) {
    return;
  }

  const existing = readBidDrafts().filter((item) => item.id !== draft.id);
  const next = [{ ...draft, updatedAt: new Date().toISOString() }, ...existing];
  window.localStorage.setItem(BID_DRAFTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bid-vault-bid-drafts-updated"));
}

export function mergeBidRequirements(
  existing: BidRequirementItem[] = [],
  incoming: BidRequirementItem[] = [],
) {
  const byId = new Map<string, BidRequirementItem>();

  for (const item of existing) {
    byId.set(item.id, item);
  }

  for (const item of incoming) {
    const current = byId.get(item.id);
    byId.set(item.id, current ? { ...item, status: current.status } : item);
  }

  return Array.from(byId.values());
}
