export type StateLocalSourceCode = "washington" | "oregon" | "idaho" | "california";

export type StateLocalOpportunityStatus = "Open" | "Closing Soon" | "Closed";

export type StateLocalOpportunityType =
  | "Open for Bids"
  | "Early Opportunity (Government is researching vendors)"
  | "Contract Already Awarded"
  | "Coming Soon";

export type StateLocalSourceStatus = "Connected" | "Planned";

export type NormalizedStateLocalOpportunity = {
  id: string;
  externalId: string;
  sourceName: string;
  sourceCode: StateLocalSourceCode;
  stateCode: string;
  title: string;
  issuingEntity: string;
  opportunityType: StateLocalOpportunityType;
  status: StateLocalOpportunityStatus;
  categoryCode: string;
  postedDate: string;
  dueDate: string;
  summary: string;
  description: string;
  location: string;
  sourceUrl: string;
  registrationRequired: boolean;
  registrationNotes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
};

export type StateLocalSourceSummary = {
  id: string;
  sourceCode: StateLocalSourceCode;
  sourceName: string;
  stateCode: string;
  status: StateLocalSourceStatus;
  cadence: string;
  description: string;
  helperText: string;
  portalUrl: string;
  lastSyncedAt: string;
};

export type StateLocalSourceSyncLog = {
  id: string;
  sourceName: string;
  sourceCode: StateLocalSourceCode;
  syncStatus: "Success" | "Partial" | "Failed";
  lastRunAt: string;
  recordsAdded: number;
  recordsUpdated: number;
  errorMessage?: string;
  notes: string;
};

export type SourceConnector<TRawOpportunity> = {
  sourceCode: StateLocalSourceCode;
  sourceName: string;
  stateCode: string;
  cadence: string;
  portalUrl: string;
  description: string;
  helperText: string;
  fetchOpportunities: () => Promise<TRawOpportunity[]>;
  normalize: (record: TRawOpportunity) => NormalizedStateLocalOpportunity;
  createSyncLog: (records: TRawOpportunity[]) => StateLocalSourceSyncLog;
};

export type RawWebsOpportunity = {
  solicitationNumber: string;
  title: string;
  issuingEntity: string;
  opportunityType: StateLocalOpportunityType;
  status: StateLocalOpportunityStatus;
  commodityCode: string;
  postedDate: string;
  dueDate: string;
  summary: string;
  description: string;
  city: string;
  stateCode: "WA";
  sourceUrl: string;
  registrationRequired: boolean;
  registrationNotes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  updatedAt: string;
};
