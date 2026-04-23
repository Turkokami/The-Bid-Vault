export type NevadaBrowserSearchMode = "active-contracts" | "open-bids";

export type NevadaBrowserSearchInput = {
  mode: NevadaBrowserSearchMode;
  keywords?: string;
  categoryCodes?: string[];
  agency?: string;
};

export type NevadaBrowserResult = {
  externalId: string;
  title: string;
  agency: string;
  dueDate?: string;
  postedDate?: string;
  sourceUrl: string;
  summary?: string;
};

export type NevadaBrowserRunSummary = {
  mode: NevadaBrowserSearchMode;
  attemptedAt: string;
  resultCount: number;
  portalUrl: string;
  blockedReason?: string;
};
