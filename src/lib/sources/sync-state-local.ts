import { websSourceSummary } from "@/lib/sources/webs";
import { fetchLiveWebsRawOpportunities } from "@/lib/sources/webs-live";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

const plannedSources: StateLocalSourceSummary[] = [
  {
    id: "source-arizona",
    sourceCode: "arizona",
    sourceName: "Arizona Procurement Portal",
    stateCode: "AZ",
    sourceType: "State",
    regionLabel: "Arizona statewide",
    status: "Planned",
    cadence: "Planned",
    description:
      "Arizona's statewide purchasing portal for agency solicitations, vendor registration, and public procurement notices.",
    helperText:
      "This is the state-level Arizona source. We will use it for Arizona agency opportunities, then layer county and city sources on top for deeper local coverage.",
    portalUrl: "https://spo.az.gov/app",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-flagstaff",
    sourceCode: "flagstaff",
    sourceName: "City of Flagstaff Bids",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned City of Flagstaff opportunity coverage through its OpenGov eProcurement bid opportunities page.",
    helperText:
      "Flagstaff is a key Northern Arizona market. This source will help contractors catch city-level work that may not appear in federal searches.",
    portalUrl: "https://flagstaff.az.gov/3922/Bid-Opportunities",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-coconino",
    sourceCode: "coconino",
    sourceName: "Coconino County Purchasing",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Coconino County coverage through its Purchasing division and Ion Wave supplier portal.",
    helperText:
      "Coconino County is important for contractors serving Flagstaff, parks, rural facilities, and regional public agencies.",
    portalUrl: "https://www.coconino.az.gov/316/Purchasing",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-yavapai",
    sourceCode: "yavapai",
    sourceName: "Yavapai County Procurement",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Yavapai County opportunity coverage through its OpenGov Procure solicitation portal.",
    helperText:
      "This extends the Northern Arizona watch area beyond Flagstaff so businesses can monitor nearby county-level opportunities.",
    portalUrl: "https://www.yavapaiaz.gov/County-Government/Bids",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-mohave",
    sourceCode: "mohave",
    sourceName: "Mohave County Procurement",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northwest Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Mohave County coverage through its OpenGov procurement portal for Kingman, Lake Havasu, Bullhead City area service providers, and county departments.",
    helperText:
      "Mohave County says vendors should use its OpenGov Projects Portal for solicitations and its Contracts Portal for awarded contract information.",
    portalUrl: "https://procurement.opengov.com/portal/mohavecounty",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-white-pine",
    sourceCode: "white-pine",
    sourceName: "White Pine County Bid Postings",
    stateCode: "NV",
    sourceType: "County / City",
    regionLabel: "Eastern Nevada",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned White Pine County coverage for Ely-area county bid postings, public works, facilities, parks, and service contracts.",
    helperText:
      "White Pine County posts bid opportunities on its county bid postings page, which can be monitored for new open solicitations.",
    portalUrl: "https://www.whitepinecounty.net/Bids.aspx",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-nye",
    sourceCode: "nye",
    sourceName: "Nye County Bid Postings",
    stateCode: "NV",
    sourceType: "County / City",
    regionLabel: "Southern Nevada",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Nye County coverage for Pahrump, Tonopah, county facilities, utilities, detention, roads, and local service opportunities.",
    helperText:
      "Nye County publishes bid and contract opportunities on its public bid postings page, including current open solicitations and bid details.",
    portalUrl: "https://www.nyecountynv.gov/Bids.aspx?CatID=showStatus&Status=open&showAllBids=&txtSort=BidNumberAsc",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-nevada",
    sourceCode: "nevada",
    sourceName: "NEVADAePro",
    stateCode: "NV",
    sourceType: "State",
    regionLabel: "Nevada statewide",
    status: "Planned",
    cadence: "Planned",
    description:
      "Nevada's official electronic procurement portal for current solicitations, bid documents, contracts, and purchase records.",
    helperText:
      "Nevada says current solicitations are posted in NEVADAePro. Opportunities can be viewed without registering, but vendor registration may be needed to submit quotes and receive notices.",
    portalUrl: "https://nevadaepro.com/",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-texas",
    sourceCode: "texas",
    sourceName: "Texas ESBD / TxSmartBuy",
    stateCode: "TX",
    sourceType: "State",
    regionLabel: "Texas statewide",
    status: "Planned",
    cadence: "Planned",
    description:
      "Texas' Electronic State Business Daily and TxSmartBuy ecosystem for state bid opportunities, awards, agencies, and NIGP class/item search.",
    helperText:
      "Texas ESBD is public for searching solicitations. State opportunities over $25,000 are commonly posted there, and searches can use agency, dates, and NIGP class/item codes.",
    portalUrl: "https://www.txsmartbuy.gov/esbd",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-oregon",
    sourceCode: "oregon",
    sourceName: "OregonBuys",
    stateCode: "OR",
    sourceType: "State",
    regionLabel: "Oregon statewide",
    status: "Planned",
    cadence: "Planned",
    description: "Planned Oregon state and local opportunity coverage.",
    helperText: "Future Oregon connector placeholder for state and local solicitations.",
    portalUrl: "https://oregonbuys.gov/",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-idaho",
    sourceCode: "idaho",
    sourceName: "Idaho eProcurement",
    stateCode: "ID",
    sourceType: "State",
    regionLabel: "Idaho statewide",
    status: "Planned",
    cadence: "Planned",
    description: "Planned Idaho state and local procurement coverage.",
    helperText: "Future Idaho connector placeholder for state and local opportunities.",
    portalUrl: "https://purchasing.idaho.gov/",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-california",
    sourceCode: "california",
    sourceName: "Cal eProcure",
    stateCode: "CA",
    sourceType: "State",
    regionLabel: "California statewide",
    status: "Planned",
    cadence: "Planned",
    description: "Planned California state and local procurement coverage.",
    helperText: "Future California connector placeholder for broader west coast coverage.",
    portalUrl: "https://caleprocure.ca.gov/",
    lastSyncedAt: "Not connected yet",
  },
];

export async function getStateLocalSyncSnapshot(): Promise<{
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sources: StateLocalSourceSummary[];
}> {
  try {
    const raws = await fetchLiveWebsRawOpportunities();
    const opportunities = raws.map((record) => ({
      id: `washington-${record.solicitationNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      externalId: record.solicitationNumber,
      sourceName: "WEBS",
      sourceCode: "washington" as const,
      stateCode: record.stateCode,
      title: record.title,
      issuingEntity: record.issuingEntity,
      opportunityType: record.opportunityType,
      status: record.status,
      categoryCode: record.commodityCode,
      postedDate: record.postedDate,
      dueDate: record.dueDate,
      summary: record.summary,
      description: record.description,
      location: `${record.city}, ${record.stateCode}`,
      sourceUrl: record.sourceUrl,
      registrationRequired: record.registrationRequired,
      registrationNotes: record.registrationNotes,
      contactName: record.contactName,
      contactEmail: record.contactEmail,
      contactPhone: record.contactPhone,
      createdAt: record.postedDate,
      updatedAt: record.updatedAt,
    }));
    const syncLogs = [
      {
        id: `sync-webs-live-${raws.length}`,
        sourceName: "WEBS",
        sourceCode: "washington" as const,
        syncStatus: "Success" as const,
        lastRunAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        recordsAdded: raws.length,
        recordsUpdated: 0,
        notes: "Live WEBS postings were loaded directly from Washington's public bid portal.",
      },
    ];

    return {
      opportunities,
      syncLogs,
      sources: [
        {
          ...websSourceSummary,
          status: "Connected",
          cadence: "Live public site",
          lastSyncedAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          }),
        },
        ...plannedSources,
      ],
    };
  } catch {
    return {
      opportunities: [],
      syncLogs: [],
      sources: [
        {
          ...websSourceSummary,
          status: "Connected",
          cadence: "Live public site",
          lastSyncedAt: "Unable to load live WEBS records",
          helperText:
            "WEBS is connected as a live public source, but the latest fetch did not return records. We are no longer showing placeholder postings here.",
        },
        ...plannedSources,
      ],
    };
  }
}
