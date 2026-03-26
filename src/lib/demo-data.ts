export type DemoTenant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  industryFocus: string;
  headquarters: string;
};

export type DemoContract = {
  id: string;
  tenantId: string;
  title: string;
  agency: string;
  naicsCode: string;
  state: string;
  location: string;
  summary: string;
  awardAmount: number;
  awardDate: string;
  expirationDate: string;
  stage: "Active" | "Watch" | "Rebid Soon";
  incumbentCompany: string;
  predictedRebidDate: string;
  confidenceScore: number;
  keyTerms: string[];
};

export type DemoWinningBid = {
  id: string;
  contractId: string;
  companyName: string;
  bidAmount: number;
  awardDate: string;
};

export type KeywordTrackingGroup = {
  id: string;
  label: string;
  terms: string[];
  matchCount: number;
  reminderWindow: string;
};

export type ServiceTier = {
  id: string;
  name: string;
  audience: string;
  priceLabel: string;
  description: string;
  features: string[];
};

export type IndustryRecommendation = {
  id: string;
  industry: string;
  category: string;
  summary: string;
  codes: Array<{
    naicsCode: string;
    title: string;
    fitReason: string;
  }>;
};

export type UploadedSourceDocument = {
  id: string;
  fileName: string;
  sourceAgency: string;
  uploadedAt: string;
  status: "Processed" | "Needs Review";
  pageCount: number;
  extractedContracts: number;
};

export type ExtractedContractRecord = {
  id: string;
  sourceDocumentId: string;
  title: string;
  agency: string;
  naicsCode: string;
  state: string;
  location: string;
  opportunityType: string;
  synopsis: string;
  responseDeadline: string;
  availabilityStatus: "Available" | "Closing Soon" | "Needs Review";
  keyTerms: string[];
};

export type SavedContractPlan = {
  id: string;
  contractId: string;
  reminderDaysBefore: number;
  ownerLabel: string;
  notes: string;
};

export type PlanningCalendarEvent = {
  id: string;
  contractId: string;
  title: string;
  agency: string;
  location: string;
  eventDate: string;
  eventType: "Reminder" | "Predicted Rebid" | "Expiration";
  reminderDaysBefore?: number;
  source: "Saved Contract";
};

export type FoiaRequestPlay = {
  id: string;
  label: string;
  targetRecords: string[];
  budgetSignals: string[];
  timingTip: string;
};

export type SourceSyncStatus = "Connected" | "Planned" | "Needs Setup";

export type DataSourceCoverage = {
  id: string;
  name: string;
  cadence: string;
  coverage: string;
  status: SourceSyncStatus;
  sourceType: "Opportunities" | "Awards" | "Forecasts" | "Portal";
  description: string;
  officialUrl: string;
  lastSyncedAt: string;
};

export type SyncActivity = {
  id: string;
  sourceId: string;
  sourceName: string;
  runLabel: string;
  ranAt: string;
  result: "Success" | "Partial" | "Failed";
  recordsAdded: number;
  notes: string;
};

export const demoTenants: DemoTenant[] = [
  {
    id: "tenant-atlas",
    name: "Atlas Contracting Group",
    slug: "atlas-contracting-group",
    description:
      "Facilities and maintenance contractor focused on federal property operations.",
    industryFocus: "Facilities maintenance",
    headquarters: "Sacramento, CA",
  },
  {
    id: "tenant-pioneer",
    name: "Pioneer Civil Works",
    slug: "pioneer-civil-works",
    description:
      "Civil and infrastructure contractor pursuing municipal and public works contracts.",
    industryFocus: "Civil infrastructure",
    headquarters: "Los Angeles, CA",
  },
  {
    id: "tenant-northstar",
    name: "Northstar Industrial Services",
    slug: "northstar-industrial-services",
    description:
      "Operations support firm specializing in custodial, logistics, and base support services.",
    industryFocus: "Industrial support",
    headquarters: "Phoenix, AZ",
  },
];

export const demoContracts: DemoContract[] = [
  {
    id: "contract-hvac-maintenance",
    tenantId: "tenant-atlas",
    title: "Regional HVAC Preventive Maintenance",
    agency: "U.S. Army Corps of Engineers",
    naicsCode: "238220",
    state: "CA",
    location: "Sacramento, CA",
    summary:
      "Preventive maintenance and emergency repair coverage for district HVAC systems across multiple federal sites.",
    awardAmount: 684000,
    awardDate: "2024-07-16",
    expirationDate: "2026-07-15",
    stage: "Rebid Soon",
    incumbentCompany: "Sierra Mechanical Group",
    predictedRebidDate: "2026-05-30",
    confidenceScore: 0.91,
    keyTerms: ["hvac", "preventive maintenance", "federal facilities", "mechanical"],
  },
  {
    id: "contract-federal-janitorial",
    tenantId: "tenant-atlas",
    title: "Federal Building Janitorial Services",
    agency: "General Services Administration",
    naicsCode: "561720",
    state: "CA",
    location: "Oakland, CA",
    summary:
      "Janitorial and day porter services for a multi-floor federal office building with monthly inspection reporting.",
    awardAmount: 392500,
    awardDate: "2025-02-03",
    expirationDate: "2027-02-02",
    stage: "Watch",
    incumbentCompany: "Desert Peak Services",
    predictedRebidDate: "2026-11-18",
    confidenceScore: 0.68,
    keyTerms: ["janitorial", "day porter", "federal building", "custodial"],
  },
  {
    id: "contract-emergency-response",
    tenantId: "tenant-atlas",
    title: "Emergency Facilities Response Support",
    agency: "Department of Energy",
    naicsCode: "236220",
    state: "NV",
    location: "Las Vegas, NV",
    summary:
      "Rapid-response repair support for energy facility incidents, including mechanical triage and site stabilization.",
    awardAmount: 940000,
    awardDate: "2025-01-11",
    expirationDate: "2027-01-10",
    stage: "Active",
    incumbentCompany: "Atlas Contracting Group",
    predictedRebidDate: "2026-10-04",
    confidenceScore: 0.74,
    keyTerms: ["emergency response", "facilities repair", "energy", "rapid response"],
  },
  {
    id: "contract-fleet-parts",
    tenantId: "tenant-pioneer",
    title: "Municipal Fleet Parts Distribution",
    agency: "City of Los Angeles",
    naicsCode: "423120",
    state: "CA",
    location: "Los Angeles, CA",
    summary:
      "Supply and delivery of fleet maintenance parts under annual blanket purchase terms for municipal vehicles.",
    awardAmount: 1185000,
    awardDate: "2024-10-11",
    expirationDate: "2026-10-10",
    stage: "Active",
    incumbentCompany: "Metro Industrial Supply",
    predictedRebidDate: "2026-08-14",
    confidenceScore: 0.73,
    keyTerms: ["fleet", "parts distribution", "municipal vehicles", "inventory"],
  },
  {
    id: "contract-stormwater-repair",
    tenantId: "tenant-pioneer",
    title: "Stormwater Repair Task Order",
    agency: "County of Orange",
    naicsCode: "237110",
    state: "CA",
    location: "Santa Ana, CA",
    summary:
      "Repair and restoration support for county stormwater infrastructure, including concrete, excavation, and line replacement.",
    awardAmount: 2275000,
    awardDate: "2024-05-07",
    expirationDate: "2026-05-06",
    stage: "Rebid Soon",
    incumbentCompany: "Pioneer Civil Works",
    predictedRebidDate: "2026-03-28",
    confidenceScore: 0.88,
    keyTerms: ["stormwater", "repair", "public works", "excavation"],
  },
  {
    id: "contract-va-custodial",
    tenantId: "tenant-northstar",
    title: "VA Clinic Custodial Services",
    agency: "Department of Veterans Affairs",
    naicsCode: "561720",
    state: "AZ",
    location: "Phoenix, AZ",
    summary:
      "Custodial services, restroom sanitation, and quality inspection support across outpatient clinics.",
    awardAmount: 512300,
    awardDate: "2024-12-02",
    expirationDate: "2026-12-01",
    stage: "Watch",
    incumbentCompany: "Northstar Industrial Services",
    predictedRebidDate: "2026-10-20",
    confidenceScore: 0.77,
    keyTerms: ["custodial", "clinic", "va", "sanitation"],
  },
  {
    id: "contract-base-landscaping",
    tenantId: "tenant-northstar",
    title: "Base Operations Landscaping",
    agency: "U.S. Air Force",
    naicsCode: "561730",
    state: "NM",
    location: "Albuquerque, NM",
    summary:
      "Grounds maintenance, irrigation oversight, and seasonal trimming for base operations facilities.",
    awardAmount: 341800,
    awardDate: "2024-08-21",
    expirationDate: "2026-08-20",
    stage: "Active",
    incumbentCompany: "Rio Verde Grounds",
    predictedRebidDate: "2026-06-25",
    confidenceScore: 0.7,
    keyTerms: ["landscaping", "grounds maintenance", "air force", "irrigation"],
  },
  {
    id: "contract-warehouse-logistics",
    tenantId: "tenant-northstar",
    title: "Warehouse Logistics Support",
    agency: "Defense Logistics Agency",
    naicsCode: "493110",
    state: "TX",
    location: "Fort Worth, TX",
    summary:
      "Warehouse receiving, staging, inventory reconciliation, and outbound logistics support for government materiel.",
    awardAmount: 1642000,
    awardDate: "2025-03-19",
    expirationDate: "2027-03-18",
    stage: "Active",
    incumbentCompany: "Northstar Industrial Services",
    predictedRebidDate: "2027-01-12",
    confidenceScore: 0.66,
    keyTerms: ["warehouse", "logistics", "inventory", "materiel"],
  },
];

export const keywordTrackingGroups: KeywordTrackingGroup[] = [
  {
    id: "keywords-facilities",
    label: "Facilities growth set",
    terms: ["hvac", "preventive maintenance", "janitorial", "federal facilities"],
    matchCount: 4,
    reminderWindow: "45 days before predicted rebid",
  },
  {
    id: "keywords-civil",
    label: "Public works set",
    terms: ["stormwater", "repair", "excavation", "fleet"],
    matchCount: 2,
    reminderWindow: "30 days before posting activity",
  },
  {
    id: "keywords-ops",
    label: "Operations support set",
    terms: ["warehouse", "custodial", "logistics", "base operations"],
    matchCount: 3,
    reminderWindow: "60 days before expected cycle",
  },
];

export const serviceTiers: ServiceTier[] = [
  {
    id: "tier-starter",
    name: "Starter",
    audience: "Solo operators and small teams",
    priceLabel: "$99/mo",
    description: "Core contract tracking with search, filters, and saved opportunities.",
    features: [
      "1 workspace",
      "Basic contract search and filters",
      "Up to 3 tracked keyword groups",
      "Watchlist and reminder setup",
    ],
  },
  {
    id: "tier-growth",
    name: "Growth",
    audience: "Growing contractors with active pipelines",
    priceLabel: "$299/mo",
    description:
      "Expanded monitoring with multi-keyword tracking, historical bid visibility, and team collaboration.",
    features: [
      "5 workspaces",
      "Unlimited tracked keyword groups",
      "Historical winning bid visibility",
      "Rebid calendar and shared dashboards",
    ],
  },
  {
    id: "tier-intelligence",
    name: "Intelligence",
    audience: "Ops teams building a competitive edge",
    priceLabel: "Custom",
    description:
      "Full-service intelligence layer with advanced scoring, tenant roles, and future alert delivery hooks.",
    features: [
      "Unlimited workspaces",
      "Custom signal groups and routing",
      "Advanced prediction and analytics",
      "Priority onboarding and integration planning",
    ],
  },
];

export const industryRecommendations: IndustryRecommendation[] = [
  {
    id: "industry-facilities",
    industry: "Facilities maintenance",
    category: "Building operations",
    summary:
      "Best fit for contractors handling preventive maintenance, repairs, janitorial, and property support.",
    codes: [
      {
        naicsCode: "238220",
        title: "Plumbing, Heating, and Air-Conditioning Contractors",
        fitReason: "Strong fit for HVAC maintenance, service calls, and mechanical system support.",
      },
      {
        naicsCode: "561210",
        title: "Facilities Support Services",
        fitReason: "Fits integrated building operations and on-site support teams.",
      },
      {
        naicsCode: "561720",
        title: "Janitorial Services",
        fitReason: "Useful for custodial, sanitation, and recurring building cleaning opportunities.",
      },
    ],
  },
  {
    id: "industry-construction",
    industry: "Construction and public works",
    category: "Infrastructure delivery",
    summary:
      "Recommended for civil, site, utility, and repair contractors targeting public works projects.",
    codes: [
      {
        naicsCode: "236220",
        title: "Commercial and Institutional Building Construction",
        fitReason: "Good fit for public building construction and renovation work.",
      },
      {
        naicsCode: "237110",
        title: "Water and Sewer Line and Related Structures Construction",
        fitReason: "Relevant for stormwater, utility, and underground infrastructure contracts.",
      },
      {
        naicsCode: "237310",
        title: "Highway, Street, and Bridge Construction",
        fitReason: "Fits roadway rehabilitation and civil transportation opportunities.",
      },
    ],
  },
  {
    id: "industry-logistics",
    industry: "Logistics and warehousing",
    category: "Supply chain support",
    summary:
      "Useful for firms handling storage, distribution, fleet support, and government supply operations.",
    codes: [
      {
        naicsCode: "493110",
        title: "General Warehousing and Storage",
        fitReason: "Matches warehousing, staging, and inventory operations.",
      },
      {
        naicsCode: "488510",
        title: "Freight Transportation Arrangement",
        fitReason: "Supports brokerage, routing, and transportation coordination work.",
      },
      {
        naicsCode: "423120",
        title: "Motor Vehicle Supplies and New Parts Merchant Wholesalers",
        fitReason: "Strong fit for fleet parts sourcing and municipal distribution contracts.",
      },
    ],
  },
  {
    id: "industry-landscaping",
    industry: "Landscaping and grounds",
    category: "Exterior maintenance",
    summary:
      "Recommended for grounds maintenance, irrigation, snow removal, and base exterior support.",
    codes: [
      {
        naicsCode: "561730",
        title: "Landscaping Services",
        fitReason: "Core code for mowing, trimming, grounds care, and irrigation oversight.",
      },
      {
        naicsCode: "238990",
        title: "All Other Specialty Trade Contractors",
        fitReason: "Can support specialty outdoor maintenance scopes tied to site work.",
      },
      {
        naicsCode: "561790",
        title: "Other Services to Buildings and Dwellings",
        fitReason: "Useful for exterior support scopes that fall outside pure landscaping.",
      },
    ],
  },
  {
    id: "industry-security",
    industry: "Security and guard services",
    category: "Protective services",
    summary:
      "Best fit for contractors delivering site security, monitoring, and protective operations.",
    codes: [
      {
        naicsCode: "561612",
        title: "Security Guards and Patrol Services",
        fitReason: "Direct match for guard force, patrol, and on-site security contracts.",
      },
      {
        naicsCode: "561621",
        title: "Security Systems Services",
        fitReason: "Relevant for alarm, monitoring, and electronic protection scopes.",
      },
      {
        naicsCode: "561622",
        title: "Locksmiths",
        fitReason: "Useful for access control and physical security hardware support.",
      },
    ],
  },
];

export const uploadedSourceDocuments: UploadedSourceDocument[] = [
  {
    id: "doc-usace-q2",
    fileName: "USACE_Q2_Facilities_Contracts.pdf",
    sourceAgency: "U.S. Army Corps of Engineers",
    uploadedAt: "2026-03-18",
    status: "Processed",
    pageCount: 44,
    extractedContracts: 3,
  },
  {
    id: "doc-va-west",
    fileName: "VA_West_Region_Opportunities.xlsx",
    sourceAgency: "Department of Veterans Affairs",
    uploadedAt: "2026-03-21",
    status: "Processed",
    pageCount: 12,
    extractedContracts: 2,
  },
  {
    id: "doc-muni-public-works",
    fileName: "Municipal_Public_Works_Bid_List.csv",
    sourceAgency: "Regional Public Works Feed",
    uploadedAt: "2026-03-24",
    status: "Needs Review",
    pageCount: 6,
    extractedContracts: 2,
  },
];

export const foiaRequestPlays: FoiaRequestPlay[] = [
  {
    id: "foia-operating-budgets",
    label: "Operating budget history",
    targetRecords: [
      "Approved facility operating budgets",
      "Budget narratives and spend plans",
      "Maintenance and repair line-item breakdowns",
    ],
    budgetSignals: [
      "Growing O&M allocations",
      "Deferred maintenance backlog",
      "Year-over-year service expansion",
    ],
    timingTip: "Best submitted 90 to 180 days before expected recompete planning starts.",
  },
  {
    id: "foia-incumbent-performance",
    label: "Incumbent contract performance",
    targetRecords: [
      "Task order summaries",
      "Performance evaluations and inspection notes",
      "Modification history tied to added scope or spend",
    ],
    budgetSignals: [
      "Frequent modifications",
      "Out-of-scope add-ons",
      "Rising service call volumes",
    ],
    timingTip: "Useful when you want to understand why a facility may rebid at a larger scope.",
  },
  {
    id: "foia-capital-planning",
    label: "Capital and facilities planning",
    targetRecords: [
      "Capital improvement plans",
      "Facility condition assessments",
      "Planning memos for replacement or renovation projects",
    ],
    budgetSignals: [
      "Upcoming renovation packages",
      "Planned systems replacement",
      "Multi-year modernization funding",
    ],
    timingTip: "Use this when trying to spot future bundled work before it hits public bid feeds.",
  },
];

export const dataSourceCoverage: DataSourceCoverage[] = [
  {
    id: "source-sam-opps",
    name: "SAM.gov Opportunities",
    cadence: "Daily",
    coverage: "Active federal solicitations, amendments, and notices",
    status: "Connected",
    sourceType: "Opportunities",
    description:
      "Primary federal source for open contract opportunities, notice updates, and solicitation activity.",
    officialUrl: "https://sam.gov/content/opportunities",
    lastSyncedAt: "Mar 26, 7:10 AM PT",
  },
  {
    id: "source-usaspending",
    name: "USAspending.gov Awards",
    cadence: "Weekly",
    coverage: "Historical awards, recipients, and agency spend context",
    status: "Connected",
    sourceType: "Awards",
    description:
      "Award enrichment source used to surface prior winners, agency spending, and incumbent research context.",
    officialUrl: "https://www.usaspending.gov/",
    lastSyncedAt: "Mar 25, 6:40 PM PT",
  },
  {
    id: "source-agency-forecasts",
    name: "Agency Forecasts",
    cadence: "Weekly",
    coverage: "Upcoming pipeline visibility before formal bid release",
    status: "Planned",
    sourceType: "Forecasts",
    description:
      "Forecast monitoring layer for early planning signals and future rebid timing before solicitations post publicly.",
    officialUrl: "https://sam.gov/content/opportunities",
    lastSyncedAt: "Forecast setup pending",
  },
  {
    id: "source-gsa-ebuy",
    name: "GSA eBuy",
    cadence: "Daily",
    coverage: "Schedule-holder RFQs and targeted government buying activity",
    status: "Planned",
    sourceType: "Portal",
    description:
      "Planned secondary portal coverage for contractors working through GSA schedule vehicles and quote requests.",
    officialUrl: "https://www.ebuy.gsa.gov/",
    lastSyncedAt: "Connector planned",
  },
];

export const syncActivities: SyncActivity[] = [
  {
    id: "sync-sam-1",
    sourceId: "source-sam-opps",
    sourceName: "SAM.gov Opportunities",
    runLabel: "Daily opportunities sync",
    ranAt: "Mar 26, 7:10 AM PT",
    result: "Success",
    recordsAdded: 14,
    notes: "Imported new federal opportunities and updated amended notices.",
  },
  {
    id: "sync-spend-1",
    sourceId: "source-usaspending",
    sourceName: "USAspending.gov Awards",
    runLabel: "Award enrichment",
    ranAt: "Mar 25, 6:40 PM PT",
    result: "Success",
    recordsAdded: 9,
    notes: "Refreshed award history, recipient names, and agency spend context.",
  },
  {
    id: "sync-forecast-1",
    sourceId: "source-agency-forecasts",
    sourceName: "Agency Forecasts",
    runLabel: "Forecast monitor",
    ranAt: "Mar 24, 9:00 AM PT",
    result: "Partial",
    recordsAdded: 3,
    notes: "Forecast coverage seeded for initial beta but source automation still needs setup.",
  },
];

export const extractedContractRecords: ExtractedContractRecord[] = [
  {
    id: "extracted-hvac-west",
    sourceDocumentId: "doc-usace-q2",
    title: "Western District HVAC Systems Maintenance",
    agency: "U.S. Army Corps of Engineers",
    naicsCode: "238220",
    state: "CA",
    location: "Sacramento, CA",
    opportunityType: "IDIQ Task Order",
    synopsis:
      "Uploaded government contract file indicates an upcoming HVAC maintenance requirement across western district federal facilities.",
    responseDeadline: "2026-04-29",
    availabilityStatus: "Available",
    keyTerms: ["hvac", "maintenance", "federal facilities", "idiq"],
  },
  {
    id: "extracted-janitorial-clinics",
    sourceDocumentId: "doc-va-west",
    title: "Outpatient Clinic Janitorial Support",
    agency: "Department of Veterans Affairs",
    naicsCode: "561720",
    state: "AZ",
    location: "Phoenix, AZ",
    opportunityType: "Service Contract",
    synopsis:
      "Parsed from uploaded VA workbook with recurring custodial scope, sanitation standards, and multi-site cleaning schedule.",
    responseDeadline: "2026-05-10",
    availabilityStatus: "Available",
    keyTerms: ["janitorial", "custodial", "clinic", "sanitation"],
  },
  {
    id: "extracted-stormwater-repair",
    sourceDocumentId: "doc-muni-public-works",
    title: "Stormwater Channel Repair Package",
    agency: "Regional Public Works Feed",
    naicsCode: "237110",
    state: "CA",
    location: "Santa Ana, CA",
    opportunityType: "Public Works Bid",
    synopsis:
      "Extracted from uploaded public works list with repair scope, excavation notes, and infrastructure line item summaries.",
    responseDeadline: "2026-04-06",
    availabilityStatus: "Closing Soon",
    keyTerms: ["stormwater", "repair", "excavation", "public works"],
  },
  {
    id: "extracted-warehouse-logistics",
    sourceDocumentId: "doc-va-west",
    title: "Regional Warehouse Logistics Operations",
    agency: "Defense Logistics Agency",
    naicsCode: "493110",
    state: "TX",
    location: "Fort Worth, TX",
    opportunityType: "Operations Support",
    synopsis:
      "Uploaded spreadsheet row points to warehousing, staging, and inventory reconciliation support for government materiel.",
    responseDeadline: "2026-05-28",
    availabilityStatus: "Available",
    keyTerms: ["warehouse", "logistics", "inventory", "materiel"],
  },
  {
    id: "extracted-security-patrol",
    sourceDocumentId: "doc-usace-q2",
    title: "Facility Patrol and Guard Support",
    agency: "U.S. Army Corps of Engineers",
    naicsCode: "561612",
    state: "NV",
    location: "Las Vegas, NV",
    opportunityType: "Guard Services",
    synopsis:
      "Extracted solicitation summary references routine patrol coverage, badging coordination, and facility access control support.",
    responseDeadline: "2026-04-18",
    availabilityStatus: "Needs Review",
    keyTerms: ["security", "patrol", "guard services", "access control"],
  },
  {
    id: "extracted-landscaping-base",
    sourceDocumentId: "doc-usace-q2",
    title: "Base Grounds and Irrigation Maintenance",
    agency: "U.S. Air Force",
    naicsCode: "561730",
    state: "NM",
    location: "Albuquerque, NM",
    opportunityType: "Grounds Maintenance",
    synopsis:
      "Uploaded contract packet includes exterior maintenance, irrigation monitoring, and seasonal grounds care requirements.",
    responseDeadline: "2026-05-22",
    availabilityStatus: "Available",
    keyTerms: ["landscaping", "grounds maintenance", "irrigation", "base operations"],
  },
];

export const savedContractPlans: SavedContractPlan[] = [
  {
    id: "saved-hvac",
    contractId: "contract-hvac-maintenance",
    reminderDaysBefore: 45,
    ownerLabel: "Atlas capture team",
    notes: "Start subcontractor outreach and pricing refresh before expected posting.",
  },
  {
    id: "saved-stormwater",
    contractId: "contract-stormwater-repair",
    reminderDaysBefore: 30,
    ownerLabel: "Pioneer estimating",
    notes: "Review prior county line items and verify excavation crew availability.",
  },
  {
    id: "saved-va-custodial",
    contractId: "contract-va-custodial",
    reminderDaysBefore: 60,
    ownerLabel: "Northstar operations",
    notes: "Prepare staffing plan and quality-control narrative ahead of renewal cycle.",
  },
  {
    id: "saved-janitorial",
    contractId: "contract-federal-janitorial",
    reminderDaysBefore: 30,
    ownerLabel: "Atlas business development",
    notes: "Track facility amendments and custodial scope changes for the next rebid window.",
  },
];

export const demoWinningBids: DemoWinningBid[] = demoContracts.map((contract) => ({
  id: `bid-${contract.id}`,
  contractId: contract.id,
  companyName: contract.incumbentCompany,
  bidAmount: contract.awardAmount,
  awardDate: contract.awardDate,
}));

export function getContractsByTenant() {
  return demoTenants.map((tenant) => ({
    ...tenant,
    contracts: demoContracts.filter((contract) => contract.tenantId === tenant.id),
  }));
}

export function getTenantBySlug(slug: string) {
  const tenant = demoTenants.find((item) => item.slug === slug);

  if (!tenant) {
    return null;
  }

  return {
    ...tenant,
    contracts: demoContracts.filter((contract) => contract.tenantId === tenant.id),
  };
}

export function getContractById(id: string) {
  const contract = demoContracts.find((item) => item.id === id);

  if (!contract) {
    return null;
  }

  return {
    ...contract,
    tenant: demoTenants.find((item) => item.id === contract.tenantId) ?? null,
    winningBid:
      demoWinningBids.find((item) => item.contractId === contract.id) ?? null,
  };
}

export function getDashboardStats() {
  return {
    tenantCount: demoTenants.length,
    contractCount: demoContracts.length,
    activeTenantCount: getContractsByTenant().filter((tenant) => tenant.contracts.length > 0)
      .length,
  };
}

export function filterContracts({
  keywords,
  naicsCode,
  agency,
  state,
}: {
  keywords: string[];
  naicsCode?: string;
  agency?: string;
  state?: string;
}) {
  return demoContracts.filter((contract) => {
    const matchesNaics = naicsCode ? contract.naicsCode === naicsCode : true;
    const matchesAgency = agency ? contract.agency === agency : true;
    const matchesState = state ? contract.state === state : true;

    const searchBlob = [
      contract.title,
      contract.summary,
      contract.agency,
      contract.location,
      ...contract.keyTerms,
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) => searchBlob.includes(keyword.toLowerCase()));

    return matchesNaics && matchesAgency && matchesState && matchesKeywords;
  });
}

export function filterExtractedContracts({
  keywords,
  naicsCode,
  agency,
  state,
}: {
  keywords: string[];
  naicsCode?: string;
  agency?: string;
  state?: string;
}) {
  return extractedContractRecords.filter((contract) => {
    const matchesNaics = naicsCode ? contract.naicsCode === naicsCode : true;
    const matchesAgency = agency ? contract.agency === agency : true;
    const matchesState = state ? contract.state === state : true;

    const searchBlob = [
      contract.title,
      contract.synopsis,
      contract.agency,
      contract.location,
      contract.opportunityType,
      ...contract.keyTerms,
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) => searchBlob.includes(keyword.toLowerCase()));

    return matchesNaics && matchesAgency && matchesState && matchesKeywords;
  });
}

export function getSavedContractsWithPlans() {
  return savedContractPlans
    .map((saved) => {
      const contract = demoContracts.find((item) => item.id === saved.contractId);

      if (!contract) {
        return null;
      }

      return {
        ...saved,
        contract,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function buildPlanningCalendarEvents(
  savedContracts: ReturnType<typeof getSavedContractsWithPlans>,
) {
  return savedContracts
    .flatMap((saved) => {
      const predictedDate = new Date(saved.contract.predictedRebidDate);
      const reminderDate = new Date(predictedDate);
      reminderDate.setDate(predictedDate.getDate() - saved.reminderDaysBefore);

      return [
        {
          id: `${saved.id}-reminder`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: reminderDate.toISOString().slice(0, 10),
          eventType: "Reminder" as const,
          reminderDaysBefore: saved.reminderDaysBefore,
          source: "Saved Contract" as const,
        },
        {
          id: `${saved.id}-rebid`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: saved.contract.predictedRebidDate,
          eventType: "Predicted Rebid" as const,
          source: "Saved Contract" as const,
        },
        {
          id: `${saved.id}-expiration`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: saved.contract.expirationDate,
          eventType: "Expiration" as const,
          source: "Saved Contract" as const,
        },
      ];
    })
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate));
}

export function getPlanningCalendarEvents() {
  return buildPlanningCalendarEvents(getSavedContractsWithPlans());
}
