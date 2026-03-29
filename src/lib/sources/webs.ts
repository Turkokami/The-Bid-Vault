import { normalizeWebsOpportunity } from "@/lib/sources/normalizers";
import type {
  RawWebsOpportunity,
  SourceConnector,
  StateLocalSourceSummary,
} from "@/lib/sources/types";

const nowLabel = "Mar 28, 9:00 AM PT";

export const websSourceSummary: StateLocalSourceSummary = {
  id: "source-webs",
  sourceCode: "washington",
  sourceName: "WEBS",
  stateCode: "WA",
  status: "Connected",
  cadence: "Daily",
  description:
    "Washington's statewide vendor portal for many state agencies, colleges, and local public entities.",
  helperText:
    "WEBS is Washington's Electronic Business Solution. Some opportunities may require registration in WEBS before you can submit a bid.",
  portalUrl: "https://pr-webs-vendor.des.wa.gov/",
  lastSyncedAt: nowLabel,
};

export const websRawOpportunities: RawWebsOpportunity[] = [
  {
    solicitationNumber: "WEBS-2026-10017",
    title: "Statewide Pest Control and Rodent Exclusion Services",
    issuingEntity: "Washington State Department of Enterprise Services",
    opportunityType: "Open for Bids",
    status: "Open",
    commodityCode: "910-59",
    postedDate: "2026-03-22",
    dueDate: "2026-04-12",
    summary:
      "Ongoing pest control, rodent exclusion, and treatment support for state-owned office and warehouse facilities.",
    description:
      "Washington State is seeking qualified vendors to provide inspection, pest treatment, rodent monitoring, entry-point sealing, and reporting across multiple state facilities. Vendors should be prepared for recurring service visits and urgent response calls.",
    city: "Olympia",
    stateCode: "WA",
    sourceUrl: "https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-2026-10017",
    registrationRequired: true,
    registrationNotes:
      "You may need an active WEBS vendor registration before you can submit a bid through the original source system.",
    contactName: "Megan Alvarez",
    contactEmail: "megan.alvarez@des.wa.gov",
    contactPhone: "(360) 555-0117",
    updatedAt: "2026-03-26",
  },
  {
    solicitationNumber: "WEBS-2026-10028",
    title: "Bird Deterrent and Roofline Exclusion for Campus Buildings",
    issuingEntity: "University of Washington",
    opportunityType: "Open for Bids",
    status: "Open",
    commodityCode: "910-27",
    postedDate: "2026-03-18",
    dueDate: "2026-04-09",
    summary:
      "Installation of bird deterrent systems, roofline sealing, and recurring exclusion maintenance on campus facilities.",
    description:
      "The University of Washington is requesting bids for humane bird deterrent systems, roofline and entry-point sealing, cleanup, and inspection reporting. Work spans several academic and administrative buildings.",
    city: "Seattle",
    stateCode: "WA",
    sourceUrl: "https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-2026-10028",
    registrationRequired: true,
    registrationNotes:
      "WEBS registration may be required to access all bid files and complete submission steps.",
    contactName: "Jordan Patel",
    contactEmail: "jpatel@uw.edu",
    contactPhone: "(206) 555-0194",
    updatedAt: "2026-03-24",
  },
  {
    solicitationNumber: "WEBS-2026-10041",
    title: "Port Wildlife Control and Airfield Bird Hazard Management",
    issuingEntity: "Port of Seattle",
    opportunityType: "Early Opportunity (Government is researching vendors)",
    status: "Open",
    commodityCode: "961-15",
    postedDate: "2026-03-25",
    dueDate: "2026-04-15",
    summary:
      "Early market research for wildlife management, bird deterrent, and airfield risk-reduction support.",
    description:
      "The Port of Seattle is collecting vendor information for a possible future contract covering airfield bird hazard management, wildlife response, deterrent devices, and compliance reporting. This is an early planning notice and may not be open for bids yet.",
    city: "Seattle",
    stateCode: "WA",
    sourceUrl: "https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-2026-10041",
    registrationRequired: true,
    registrationNotes:
      "Registration in WEBS may be required before later bid steps if this opportunity moves forward.",
    contactName: "Rachel Kim",
    contactEmail: "rachel.kim@portseattle.org",
    contactPhone: "(206) 555-0139",
    updatedAt: "2026-03-27",
  },
  {
    solicitationNumber: "WEBS-2026-10056",
    title: "County Facilities Wildlife Entry-Point Sealing and Monitoring",
    issuingEntity: "Spokane County",
    opportunityType: "Coming Soon",
    status: "Closing Soon",
    commodityCode: "910-59",
    postedDate: "2026-03-20",
    dueDate: "2026-04-02",
    summary:
      "County facilities maintenance package focused on wildlife exclusion, sealing gaps, and follow-up monitoring.",
    description:
      "Spokane County is preparing a facilities protection package covering inspection, wildlife entry-point sealing, attic and crawlspace exclusion repairs, and follow-up monitoring. Vendors should expect recurring service locations and photo documentation requirements.",
    city: "Spokane",
    stateCode: "WA",
    sourceUrl: "https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-2026-10056",
    registrationRequired: false,
    registrationNotes:
      "Review the original posting carefully. Some file access or final submission steps may still happen in WEBS.",
    contactName: "Daniel Foster",
    contactEmail: "dfoster@spokanecounty.org",
    contactPhone: "(509) 555-0168",
    updatedAt: "2026-03-27",
  },
  {
    solicitationNumber: "WEBS-2026-10072",
    title: "Tacoma Public Buildings Integrated Pest Management Program",
    issuingEntity: "City of Tacoma",
    opportunityType: "Open for Bids",
    status: "Open",
    commodityCode: "910-59",
    postedDate: "2026-03-16",
    dueDate: "2026-04-14",
    summary:
      "Integrated pest management program for city-owned offices, community buildings, and support sites.",
    description:
      "The City of Tacoma is seeking a vendor for routine pest control, treatment, monitoring, reporting, and emergency service response. The scope includes prevention work, inspections, and clear recordkeeping for city staff.",
    city: "Tacoma",
    stateCode: "WA",
    sourceUrl: "https://pr-webs-vendor.des.wa.gov/solicitation/WEBS-2026-10072",
    registrationRequired: true,
    registrationNotes:
      "An active vendor profile in WEBS may be needed before you can submit a formal response.",
    contactName: "Emily Rogers",
    contactEmail: "erogers@cityoftacoma.org",
    contactPhone: "(253) 555-0126",
    updatedAt: "2026-03-23",
  },
];

export const websConnector: SourceConnector<RawWebsOpportunity> = {
  sourceCode: "washington",
  sourceName: "WEBS",
  stateCode: "WA",
  cadence: "Daily",
  portalUrl: websSourceSummary.portalUrl,
  description: websSourceSummary.description,
  helperText: websSourceSummary.helperText,
  fetchOpportunities: async () => websRawOpportunities,
  normalize: normalizeWebsOpportunity,
  createSyncLog: (records) => ({
    id: `sync-webs-${records.length}`,
    sourceName: "WEBS",
    sourceCode: "washington",
    syncStatus: "Success",
    lastRunAt: nowLabel,
    recordsAdded: records.length,
    recordsUpdated: 0,
    notes: "Washington WEBS opportunities were normalized into The Bid Vault's cleaner state and local search view.",
  }),
};
